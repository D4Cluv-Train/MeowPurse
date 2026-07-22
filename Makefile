.PHONY: up down restart status init-db drop-db reset-db run front health clean install

# ---------- 基础设施（MySQL / Redis）----------
up:              ## 启动 MySQL + Redis
	docker compose up -d

down:            ## 停止容器（保留数据卷）
	docker compose down

restart:         ## 重启所有容器
	docker compose down && docker compose up -d

status:          ## 查看容器状态
	docker compose ps

# ---------- 数据库 ----------
init-db:         ## 建表 + 预置分类（--recreate 删表重建）
	cd backend && .venv/bin/python -m scripts.init_db --recreate

drop-db:         ## 删除 MySQL 数据库
	@echo "⚠ 确认删除数据库 meowpurse? 输入 y 继续:" && read ans && [ "$$ans" = "y" ] || (echo "已取消" && exit 1)
	docker exec meowpurse-mysql mysql -uroot -pmeowpurse123 -e "DROP DATABASE IF EXISTS meowpurse; CREATE DATABASE meowpurse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

reset-db: drop-db init-db  ## 重建数据库（删库 → 建表 → 分类）

# ---------- 运行 ----------
run:             ## 启动后端 :8800
	cd backend && .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8800

front:           ## 启动前端（Expo）
	cd frontend && npx expo start

health:          ## 健康检查
	curl -s http://localhost:8800/api/v1/health | python3 -m json.tool

# ---------- 工具 ----------