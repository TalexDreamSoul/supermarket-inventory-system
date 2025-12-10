# 帕神库存管理系统 API 开发计划

版本：v0.1（根据 2024-xx 需求说明整理）
目标：分阶段落地认证、商品、库存、订单、报表相关 API，确保统一响应格式和权限矩阵落地。

## 阶段 0：底座与公共能力

- [ ] 0.1 技术选型与仓库结构整理：确定后端框架（推荐 FastAPI + SQLAlchemy or NestJS + Prisma），补齐运行脚本、环境模板、`docker-compose`。
- [ ] 0.2 配置管理：实现 `.env` 加载、分环境配置、密钥管理（JWT secret、数据库 DSN、跨域白名单）。
- [ ] 0.3 数据模型设计：建模用户/角色、商品、分类、供应商、库存明细、库存操作、订单、订单行、报表快照。补齐主外键、唯一索引、软删除字段。
- [ ] 0.4 通用响应体与错误码：实现 `code/message/data` 包装器、全局异常处理、错误码枚举（400/401/403/404/500）。
- [ ] 0.5 安全与日志：接入 JWT、密码哈希、操作日志、审计（记录 operator_id、ip、UA）。
- [ ] 0.6 测试与质量基线：选型测试框架、搭建 CI、准备最小可执行单元测试样例。

## 阶段 1：认证与用户管理（文档第 1 章）

- [ ] 1.1 `/api/auth/register`：请求体验证、重复用户名检查、角色合法性校验。
- [ ] 1.2 `/api/auth/login`：密码校验、JWT 签发与刷新策略、失败次数风控。
- [ ] 1.3 `/api/auth/users` 列表：分页、按角色过滤、返回 `created_at`。
- [ ] 1.4 `/api/auth/users/<id>` 详情：鉴权 admin、404 处理。
- [ ] 1.5 `/api/auth/users/<id>` PUT：支持密码重置、角色更新、字段审计。
- [ ] 1.6 `/api/auth/users/<id>` DELETE：软删除 + 关联检查。
- [ ] 1.7 RBAC 中间件：从 JWT 解析角色、注入请求上下文、复用到其他模块。

## 阶段 2：商品管理（文档第 2 章）

- [ ] 2.1 `/api/products` POST：商品编码去重、补全 category/supplier 引用校验、记录创建者。
- [ ] 2.2 `/api/products` GET：分页 + 过滤（category_id、supplier_id、status），默认按创建时间倒序。
- [ ] 2.3 `/api/products/<id>` GET：返回库存、创建/修改人信息。
- [ ] 2.4 `/api/products/<id>` PUT：允许粒度字段更新（价格、库存阈值、状态），记录操作日志。
- [ ] 2.5 `/api/products/<id>` DELETE：鉴权 admin、判断库存是否为 0，否则拒绝。
- [ ] 2.6 `/api/products/<id>/stock` GET：聚合当前库存、最小/最大库存、状态字段。
- [ ] 2.7 依赖字典：补充分类、供应商 CRUD（虽然文档未列，但商品接口依赖）。

## 阶段 3：库存操作（文档第 3 章）

- [ ] 3.1 `/api/stock/in`：参数校验（quantity>0）、入库类型记录 `stock_before/after`、与订单关联。
- [ ] 3.2 `/api/stock/out`：同理扣减库存，阻止出现负库存。
- [ ] 3.3 `/api/stock/adjust`：调整原因、备注、双人审核（至少记录审核字段）。
- [ ] 3.4 `/api/stock/operations` GET：分页、按产品/类型/日期过滤，支持导出。
- [ ] 3.5 `/api/stock/operations/<id>` GET：返回完整操作上下文。
- [ ] 3.6 库存事务保障：采用数据库事务 + 行级锁，确保高并发下库存一致。

## 阶段 4：订单管理（文档第 4 章）

- [ ] 4.1 `/api/orders` POST：订单号唯一校验、order_type 垃圾数据拦截、items 列表非空校验。
- [ ] 4.2 `/api/orders` GET：分页、按类型/状态/时间过滤、返回 `total_amount`。
- [ ] 4.3 `/api/orders/<order_id>` GET：订单基本信息 + items 列表。
- [ ] 4.4 `/api/orders/<order_id>/operations` GET：聚合库存操作列表。
- [ ] 4.5 `/api/orders/<order_id>/status` PUT：状态流转（pending -> processing -> completed/cancelled），写入操作日志。
- [ ] 4.6 订单与库存联动：采购单完成触发入库、销售单触发出库。

## 阶段 5：库存报表（文档第 5 章）

- [ ] 5.1 `/api/reports/inventory_alerts`：基于 min/max 计算预警数量与详情。
- [ ] 5.2 `/api/reports/daily_summary`：支持 `date` 查询，返回每日库存快照。
- [ ] 5.3 `/api/reports/inventory_report`：生成日报，包含 summary、stock_summary、stock_operations。
- [ ] 5.4 `/api/reports/stock_trend`：支持产品维度、时间范围，可扩展为折线图数据源。
- [ ] 5.5 报表缓存策略：热点日期查询缓存、定时任务生成日报。

## 阶段 6：权限矩阵与审计

- [ ] 6.1 角色定义：`admin/super_admin、stock_operator、purchaser、cashier、finance、viewer`。
- [ ] 6.2 资源权限映射：将表格映射成中间件配置，复用到路由装饰器。
- [ ] 6.3 操作审计：记录 operator_id、接口、payload 摘要、结果。
- [ ] 6.4 界面/文档同步：在 README/前端展示权限矩阵，减少歧义。

## 阶段 7：统一错误码与异常处理

- [ ] 7.1 定义错误码常量：400 通用、401 未授权、403 禁止、404 资源不存在、500 内部错误。
- [ ] 7.2 输出格式约束：所有接口严格遵守 `code/message/data`。
- [ ] 7.3 验证失败提示：字段级错误信息、i18n 预留。

## 阶段 8：测试、监控与交付

- [ ] 8.1 单元 & 集成测试：覆盖核心业务流（注册登录、商品 CRUD、库存 in/out、订单状态流转）。
- [ ] 8.2 性能与并发：库存增减的并发测试、长事务回滚验证。
- [ ] 8.3 部署流水线：CI/CD、数据库迁移自动化、灰度方案。
- [ ] 8.4 文档交付：生成 OpenAPI/Swagger、补充 `README` 和操作说明。

> 以上为第一版工作计划，实施中如需求变化需同步更新本文件并在 README 标注更新时间。
