# 喵记（MeowPurse）项目架构设计文档 v0.0.1

> 本文档参照 [APISupporter](/Users/gswl00001/Me/APISupporter) 项目的代码规范与架构模式设计。

---

## 1. 架构设计原则

| 原则 | 说明 |
|------|------|
| **单一职责** | 每层只负责一个技术维度，职责边界清晰 |
| **依赖倒置** | 高层依赖抽象接口，不依赖具体实现 |
| **开放封闭** | 对扩展开放、对修改封闭，新增能力通过扩展而非修改实现 |
| **OpenAI 兼容** | 模型定义与工具注册遵循 OpenAI ChatCompletion 规范，DashScope 兼容接口 |
| **模块隔离** | Agent 异常被隔离降级，不影响整体编排 |

---

## 2. 总体架构分层

```
┌────────────────────────────────────────────────────────────┐
│                    Frontend (React Native SPA)              │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────────┐ │
│  │   账单界面    │   │   个人中心    │   │  [+] 添加账单弹窗  │ │
│  │  (列表/筛选)  │   │  (设置/统计)  │   │ │  语音输入       │ │
│  │             │   │             │   │ │  + 文本编辑     │ │
│  └──────┬──────┘   └──────┬──────┘   └────────┬─────────┘ │
│         └────────┴────────┴──────────────────┘              │
│                Bottom Tab Navigator                         │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌────────────────────────────────────────────────────────────┐
│                  Backend (FastAPI + Python)                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                     api 层                            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │   │
│  │  │ 账单API   │ │ 语音API   │ │ 复盘API   │ │ 用户API │  │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬───┘  │   │
│  └───────┼────────────┼────────────┼────────────┼───────┘   │
│          ▼            ▼            ▼            ▼           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    agent 层                            │   │
│  │  ┌────────────────┐ ┌──────────────┐ ┌───────────┐  │   │
│  │  │ 语音记账 Agent  │ │ 智能复盘Agent │ │ Supervisor │  │   │
│  │  │ (LangGraph编排) │ │ (LangGraph编排)│ │ (编排器)   │  │   │
│  │  └────────┬───────┘ └──────┬───────┘ └───────────┘  │   │
│  └───────────┼────────────────┼──────────────────────────┘   │
│              │                │                               │
│  ┌───────────┼────────────────┼──────────────────────────┐   │
│  │  tools 层     │  llm 层          │  memory 层            │   │
│  │  ┌────────┐  │ ┌──────────────┐ │ ┌────────────────┐  │   │
│  │  │语音识别 │  │ │ ChatOpenAI   │ │ │  会话记忆      │  │   │
│  │  │信息抽取 │  │ │ (DashScope)  │ │ │  (Redis)       │  │   │
│  │  │账单查询 │  │ │  模型路由     │ │ │  实体记忆      │  │   │
│  │  │复盘生成 │  │ └──────────────┘ │ └────────────────┘  │   │
│  │  └────────┘  └──────────────────┘                     │   │
│  └──────────────┬────────────────────────────────────────┘   │
│                 │                                             │
│  ┌──────────────┴────────────────────────────────────────┐   │
│  │                    cache 层                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │   │
│  │  │ Redis    │ │ 内存缓存  │ │ 缓存过期/失效策略     │  │   │
│  │  └────┬─────┘ └──────────┘ └──────────────────────┘  │   │
│  │       │                                               │   │
│  │  ┌────┴───────────────────────────────────────────┐   │   │
│  │  │           数据持久化 (MySQL/文件)               │   │   │
│  │  └───────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. 前端设计

### 3.1 页面结构

```
App
└── BottomTabNavigator
    ├── 账单界面 (BillScreen)          ← Tab 1
    ├── 添加账单 (AddBillButton)       ← 中间悬浮 [+] 按钮
    └── 个人中心 (ProfileScreen)       ← Tab 3
```

### 3.2 组件树

```
BillScreen
├── BillList                    账单列表
│   ├── BillCard                账单卡片（金额、类别、时间）
│   └── FilterBar               筛选栏（时间/类别/金额）
│
ProfileScreen
├── UserInfo                    用户信息
├── Statistics                  消费统计概览
├── ReviewReport                智能复盘报告
└── Settings                    设置（导出/隐私等）

AddBillModal (弹窗)
├── RecordingButton             录音按钮 + 波形动画
├── SpeechPreview               语音识别文本预览
├── AlternativesList            置信度备选项列表
│   └── AlternativeItem         单条备选项（点击切换）
├── BillForm                    账单编辑表单
│   ├── AmountInput             金额输入
│   ├── CategoryPicker          类别选择
│   ├── TimePicker              时间选择
│   └── NoteInput               备注输入
└── ConfirmButton               确认保存按钮
```

### 3.3 交互流程

```
用户点击 [+] → 弹出 AddBillModal
  ├─ 自动开始录音 → 语音识别 → 填充表单
  ├─ 用户可直接编辑表单任意字段
  ├─ 若识别有备选项 → 展示 AlternativesList 供一键切换
  └─ 用户确认 → 提交 → 关闭弹窗 → 刷新账单列表
```

---

## 4. 后端分层设计

### 4.1 api 层 — 对外接口

**职责**：整合底层能力，暴露 RESTful API，处理请求/响应序列化

**结构**：
- `api/routes/` — bill.py (账单CRUD+筛选)、voice.py (语音上传+识别)、review.py (复盘)、user.py (用户)
- `api/middlewares/` — auth.py (认证)、rate_limit.py (限流)
- `api/schemas/` — Pydantic 请求/响应模型

**设计要点**：
- api 层不包含业务逻辑，仅做参数校验和结果封装
- 调用 agent 层完成 AI 相关操作，调用 db/cache 完成数据操作
- 统一返回格式 `{"code": 0, "data": {...}, "message": "ok"}`

---

### 4.2 agent 层 — AI 编排

**职责**：基于 LangGraph 实现 Agent Supervisor 编排模式，定义状态机、流程控制

**状态定义**：AgentState 使用 TypedDict，含输入上下文、处理过程、工具调用结果

**编排模式**：
- Supervisor 构建 Graph：`build_graph()` → `compile()` → `ainvoke()`
- Agent 仅负责流程编排，不直接调用 AI 模型，通过 tools 层完成
- 每个 Agent 节点异常被 try/except 隔离降级，不影响整体编排

**v0.0.1 包含**：语音记账 Agent（录音→识别→解析→确认→保存）、智能复盘 Agent（查询→分析→生成报告）

---

### 4.3 tools 层 — Agent 工具

**职责**：Agent 可调用的工具函数集合，遵循 OpenAI Function Calling 规范

**注册机制**：
- `ToolSpec` dataclass 定义工具（name, description, parameters JSON Schema, func, timeout, retries）
- `REGISTRY` 全局字典管理所有工具
- `register(spec)` 注册工具
- `execute(name, args, ctx)` 执行工具（含超时+重试）
- `openai_tools()` 生成 OpenAI Function Calling 格式的工具定义

**工具函数签名**：`async def func(args: dict, ctx: ToolContext) -> dict`
**工具返回格式**：`{"ok": True, "data": ...}` / `{"ok": False, "error": "..."}`

**v0.0.1 内置工具**：

| 工具名 | 功能 | 类别 |
|--------|------|------|
| `voice_recognize` | 语音→文本 | voice |
| `info_extract` | 文本→结构化账单 | bill |
| `query_bills` | 条件查询账单 | bill |
| `save_bill` | 保存账单 | bill |
| `generate_review` | 生成复盘报告 | review |

---

### 4.4 llm 层 — 模型导入与路由

**职责**：LLM 客户端初始化、模型任务路由、重试策略

**客户端**：使用 `openai` SDK + DashScope 兼容接口（`base_url=https://dashscope.aliyuncs.com/compatible-mode/v1`）
**单例**：`@lru_cache` 装饰 `_client()` 复用 AsyncOpenAI 实例
**重试**：`tenacity` 指数退避，仅重试瞬时错误（超时/连接/限流/5xx），最多 3 次
**路由**：`model_for(task)` 按任务类型分配模型 — 简单任务（信息抽取）用 `qwen-turbo`，复杂任务（复盘）用 `qwen-plus`

---

### 4.5 memory 层 — 会话记忆

**职责**：管理 Agent 会话上下文，基于 Redis 实现

- 历史消息窗口 20 条，6 小时过期
- 实体记忆：多轮对话中收集的关键信息（如已提供的 request_id）复用
- Key 模式：`mem:hist:{session_id}`、`mem:ent:{session_id}`

---

### 4.6 cache 层 — 缓存

**职责**：统一缓存抽象，Redis 客户端管理

- `@lru_cache` 单例获取 Redis 连接

**缓存 Key 设计**：

| Key 模式 | 用途 | TTL |
|----------|------|-----|
| `session:{user_id}` | Agent 会话状态 | 30min |
| `mem:hist:{session_id}` | 会话消息历史 | 6h |
| `bills:list:{user_id}:{hash}` | 账单列表缓存 | 5min |
| `categories:all` | 分类列表 | 1h |
| `review:{user_id}:{period}` | 复盘报告 | 失效刷新 |

---

## 5. 安全与认证

- **密码存储**：bcrypt 哈希
- **JWT 令牌**：HS256 签名，过期时间可配
- **依赖注入**：FastAPI Depends 模式，`get_current_user()` 解析令牌返回 `CurrentUser` 对象
- **统一鉴权**：api 层路由通过 `Depends(get_current_user)` 保护

---

## 6. 配置管理

使用 `pydantic-settings` + `.env` 文件：
- LLM 配置（dashscope_api_key, llm_base_url, 模型名）
- MySQL 配置（host, port, user, password, db）
- Redis 配置（url）
- JWT 配置（secret, expire）
- 业务阈值（语音置信度阈值等）
- 环境配置（app_env, log_level）

---

## 7. 数据库设计

### 7.1 连接管理

- 异步引擎（aiomysql）用于应用运行时
- 所有 ORM 模型集中在 `db/models.py` 单文件
- SQLAlchemy 2.0 `Mapped` / `mapped_column` 声明式

### 7.2 核心表结构

```
bills 表：
  id, user_id, amount, category, note, source(voice/manual),
  recorded_at, created_at, updated_at
  索引：idx_user_time(user_id, recorded_at), idx_category(user_id, category)

categories 表：
  id, name(unique), icon, sort_order
```

---

## 8. 请求处理流程

### 8.1 语音记账流程

```
前端录音完成
    │
    ▼
POST meowpurse/api/voice/recognize  (audio binary)
    │
    ▼
api/voice.py → agent supervisor 编排
    │
    ├── node:speech_recognition → tools.execute("voice_recognize")
    │   └── 调用 llm 层 DashScope SenseVoice
    │
    ├── node:info_extraction → tools.execute("info_extract")
    │   └── 调用 llm 层 Qwen-Turbo
    │
    ▼
返回 {recognized_text, parsed_results(含备选项)}
    │
    ▼
前端展示表单 + 备选项 → 用户编辑/确认
    │
    ▼
POST meowpurse/api/bills  {confirmed_bill_data}
    │
    ▼
api/bill.py → tools.execute("save_bill") → MySQL 写入
    │
    ▼
返回 {bill_id, success}
```

### 8.2 智能复盘流程

```
GET meowpurse/api/review?period=weekly
    │
    ▼
api/review.py → agent supervisor 编排
    │
    ├── cache 命中 → 直接返回
    ├── tools.execute("query_bills") → 查询 MySQL
    ├── llm 层 Qwen-Plus 生成分析
    ├── cache.set() 缓存报告
    │
    ▼
返回 ReviewReport JSON
```

---

## 9. 目录结构

```
meowpurse/
│
├── frontend/                          # React Native 前端 SPA
│   ├── src/
│   │   ├── screens/
│   │   │   ├── BillScreen.tsx         # 账单列表页面
│   │   │   ├── ProfileScreen.tsx      # 个人中心页面
│   │   │   └── AddBillModal.tsx       # 添加账单弹窗
│   │   ├── components/                # 通用组件
│   │   ├── services/api.ts            # API 调用
│   │   ├── stores/                    # 状态管理
│   │   └── App.tsx                    # 根组件 (TabNavigator)
│   └── package.json
│
├── backend/                           # FastAPI 后端
│   ├── app/
│   │   ├── api/                       # API 接口层
│   │   │   ├── routes/
│   │   │   │   ├── bill.py
│   │   │   │   ├── voice.py
│   │   │   │   ├── review.py
│   │   │   │   └── user.py
│   │   │   └── schemas/               # Pydantic 请求/响应模型
│   │   │
│   │   ├── agent/                     # Agent 编排层
│   │   │   ├── state.py              # AgentState TypedDict
│   │   │   ├── supervisor.py         # LangGraph 编排器
│   │   │   ├── recording_agent.py    # 语音记账节点
│   │   │   └── review_agent.py       # 智能复盘节点
│   │   │
│   │   ├── tools/                     # Agent 工具层
│   │   │   ├── registry.py           # 工具注册中心
│   │   │   ├── voice_tools.py        # 语音识别工具
│   │   │   ├── bill_tools.py         # 账单查询/保存工具
│   │   │   └── review_tools.py       # 复盘工具
│   │   │
│   │   ├── llm/                       # 模型层
│   │   │   ├── client.py             # ChatOpenAI 客户端
│   │   │   └── router.py             # 模型任务路由
│   │   │
│   │   ├── memory/                    # 记忆层
│   │   │   └── session.py            # Redis 会话记忆
│   │   │
│   │   ├── cache/                     # 缓存层
│   │   │   └── redis_client.py       # Redis 客户端
│   │   │
│   │   ├── db/                        # 数据持久化
│   │   │   ├── database.py           # SQLAlchemy 引擎
│   │   │   └── models.py             # ORM 模型
│   │   │
│   │   ├── core/                      # 核心配置
│   │   │   ├── config.py             # pydantic-settings
│   │   │   ├── security.py           # JWT + bcrypt
│   │   │   └── deps.py               # FastAPI 依赖注入
│   │   │
│   │   └── main.py                    # FastAPI 入口
│   │
│   ├── pyproject.toml
│   └── .env
│
├── docker-compose.yml                 # MySQL + Redis
├── Makefile
└── .docs/
    ├── PRD.md
    └── ARCHITECTURE.md
```

---

## 10. 代码规范

| 规范 | 说明 |
|------|------|
| Python 版本 | ≥ 3.11 |
| 代码格式 | ruff, line-length=100 |
| 类型注解 | 全量类型注解（Mapped, TypedDict, dataclass） |
| 单例模式 | `@lru_cache` 装饰函数（config, redis, llm client） |
| 重试策略 | tenacity 指数退避，仅重试瞬时错误 |
| 异步优先 | 全栈 async + await |
| ORM 风格 | SQLAlchemy 2.0 Mapped / mapped_column 声明式 |
| 配置管理 | pydantic-settings + `.env` 文件 |
| 工具函数签名 | `async def func(args: dict, ctx: ToolContext) -> dict` |

---

## 11. 后续版本扩展路径

| 版本 | 新增内容 | 扩展方式 |
|------|---------|---------|
| v0.1.0 | 方言识别、复盘质量优化 | 替换/增强 tools 实现 |
| v0.2.0 | RAG 语义搜索、个性化推荐 | 新增 rag/ 模块 |
| v1.0.0 | 多用户协作、家庭账本、银行对账 | api 层新增路由，agent 层新增 Agent |

---

> **版本**: v0.0.1<br>
> **更新日期**: 2026-07-22<br>
> **对应PRD**: 喵记(MeowPurse)需求文档（PRD）v0.0.1.md<br>
> **参考项目**: [APISupporter](/Users/gswl00001/Me/APISupporter)
