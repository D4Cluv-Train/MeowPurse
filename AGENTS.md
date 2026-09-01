# AGENTS.md

本文件适用于整个仓库，供参与本项目的开发者与编码代理协作时遵循。

## 项目概览

MeowPurse（喵记）是一个前后端分离的记账应用：

- `frontend/`：React Native + Expo + TypeScript，使用 pnpm 管理依赖。
- `backend/`：FastAPI + SQLAlchemy，依赖声明位于 `pyproject.toml`。
- `docker-compose.yml`：本地 MySQL 与 Redis 服务编排。
- `Makefile`：常用的安装、启动、停止和日志命令入口。

## 分支与协作流程

- `main` 是受保护的稳定分支，不直接提交或强制推送。
- 日常开发从 `develop` 创建短生命周期分支，命名建议为 `feature/<topic>`、`fix/<topic>` 或 `chore/<topic>`。
- 功能分支通过 Pull Request 合并回 `develop`；发布时再由 `develop` 向 `main` 提交 Pull Request。
- 提交应保持单一目的，提交信息使用 Conventional Commits，例如 `feat(auth): add token refresh`。
- 提交前同步目标分支，解决冲突后再发起或更新 Pull Request。
- 不提交密钥、令牌、真实用户数据、数据库文件、构建产物或本地环境配置。

## 开发约定

- 修改前先阅读相关模块，尽量沿用现有目录结构、命名和实现模式。
- 只修改任务所需内容；不要顺手重构无关代码或覆盖他人的未提交改动。
- TypeScript 保持严格类型，避免无理由使用 `any`；复用 `frontend/src/types/` 中的共享类型。
- React Native 组件保持职责单一；页面样式放在同目录的 `styles.ts`，网络请求集中在 API 层。
- FastAPI 路由放在 `backend/app/api/`，数据库访问沿用 `backend/app/db/` 的会话和模型约定。
- API 契约发生变化时，同步更新前端调用、类型定义及相关文档。
- 新增依赖前确认确有必要，并更新对应锁文件；不要混用 npm、yarn 与 pnpm。

## 常用命令

优先使用仓库根目录的 `Makefile`：

```bash
make up
make run
make front
make health
make status
make down
```

需要单独操作子项目时：

```bash
cd backend && .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8800
cd frontend && pnpm install
cd frontend && pnpm start
```

## 验证与交付

- 对改动运行最小且相关的检查，并在条件允许时运行完整测试或构建。
- 前端至少执行 TypeScript 检查及相关测试；后端至少验证应用可导入并运行相关测试。
- 涉及数据库结构时，说明迁移、兼容性和回滚方式。
- Pull Request 描述应包含变更目的、主要实现、验证结果、风险与必要的截图。
- 若某项检查因环境限制无法运行，必须在交付说明中明确列出，不得把未验证描述为已通过。
