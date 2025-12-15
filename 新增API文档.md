# 分类与供应商 CRUD 接口文档

本模块覆盖分类与供应商的新增/查询/更新/删除接口，统一使用 `code/message/data` 响应包装。成功时 `code = 0`，`message` 为提示文本，`data` 携带具体结果；失败时 `code` 对应错误码，`message` 说明失败原因。

- **鉴权**：列表查询可公开访问；新增/更新需具备指定角色；删除严格限管理员并要求无关联商品。
- **分页参数**：`page` 从 1 开始，`size` 默认 20。查询关键词统一用 `keyword`。

## 分类管理 API

### GET /api/categories
- **功能**：按关键词分页查询分类。
- **查询参数**：`page`、`size`、`keyword`（模糊匹配 `category_name`）。
- **响应 data**：
  ```json
  {
    "items": [
      {
        "category_id": 1,
        "category_name": "饮料",
        "description": "含瓶装/罐装饮料",
        "product_count": 12,
        "total_stock": 560,
        "created_at": "2024-05-01T12:00:00Z",
        "updated_at": "2024-05-02T09:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 20
  }
  ```
- **权限**：公开。

### POST /api/categories
- **功能**：创建分类。
- **请求体**：
  ```json
  {
    "category_name": "乳制品",
    "description": "牛奶/酸奶"
  }
  ```
- **响应 data**：与详情字段一致，包含新建 `category_id/created_at/updated_at`。
- **权限**：`admin` 或 `stock_operator`。
- **典型错误**：400（名称重复或缺失）、401（未登录）、403（无权限）。

### GET /api/categories/{category_id}
- **功能**：查询单个分类详情。
- **路径参数**：`category_id`。
- **响应 data**：单条分类记录。
- **权限**：公开。
- **典型错误**：404（分类不存在）。

### PUT /api/categories/{category_id}
- **功能**：更新分类名称/描述。
- **请求体**：与创建一致，字段可选。
- **响应 data**：更新后的分类记录。
- **权限**：`admin` 或 `stock_operator`。
- **典型错误**：400（名称重复）、404（分类不存在）。

### DELETE /api/categories/{category_id}
- **功能**：删除分类，需确保分类下无商品。
- **权限**：仅 `admin`。
- **典型错误**：400（存在关联商品无法删除）、404（分类不存在）。

## 供应商管理 API

### GET /api/suppliers
- **功能**：按关键词分页查询供应商。
- **查询参数**：`page`、`size`、`keyword`（匹配 `supplier_name`）。
- **响应 data**：
  ```json
  {
    "items": [
      {
        "supplier_id": 1,
        "supplier_name": "XX 贸易",
        "contact_person": "张三",
        "phone": "188****1234",
        "email": "ops@example.com",
        "address": "上海市张江高科路 100 号",
        "product_count": 8,
        "total_stock": 320,
        "created_at": "2024-05-01T12:00:00Z",
        "updated_at": "2024-05-02T09:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 20
  }
  ```
- **权限**：公开。

### POST /api/suppliers
- **功能**：创建供应商。
- **请求体**：
  ```json
  {
    "supplier_name": "优鲜供应链",
    "contact_person": "李四",
    "phone": "13800001111",
    "email": "buyer@example.com",
    "address": "北京市亦庄开发区"
  }
  ```
- **响应 data**：包含新建 `supplier_id` 及时间字段。
- **权限**：`admin`、`purchaser` 或 `stock_operator`。
- **典型错误**：400（名称重复或字段缺失）、401、403。

### GET /api/suppliers/{supplier_id}
- **功能**：查询单个供应商详情。
- **路径参数**：`supplier_id`。
- **响应 data**：单条供应商记录。
- **权限**：公开。
- **典型错误**：404（供应商不存在）。

### PUT /api/suppliers/{supplier_id}
- **功能**：更新供应商信息。
- **请求体**：与创建一致，字段可选。
- **响应 data**：更新后的供应商记录。
- **权限**：`admin`、`purchaser` 或 `stock_operator`。
- **典型错误**：400（名称重复）、404（供应商不存在）。

### DELETE /api/suppliers/{supplier_id}
- **功能**：删除供应商，需确保无关联商品。
- **权限**：仅 `admin`。
- **典型错误**：400（有关联商品无法删除）、404（供应商不存在）。

## 通用错误响应示例
```json
{
  "code": 400,
  "message": "名称已存在",
  "data": null
}
```
