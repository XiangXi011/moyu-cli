# opencli-plugin-moyu

魔芋AI (moyu.info) 控制台 CLI 插件，将平台管理操作命令行化。

## 前置条件

- [OpenCLI](https://github.com/jackwener/opencli) >= 1.0.0
- Chrome 浏览器 + OpenCLI 浏览器桥接扩展
- 已在 Chrome 中登录 [魔芋AI](https://www.moyu.info)

## 安装

```bash
opencli plugin install github:你的用户名/opencli-plugin-moyu
```

## 命令一览

| 命令 | 类型 | 说明 |
|------|------|------|
| `opencli moyu balance` | 读取 | 账户余额和用量统计 |
| `opencli moyu user` | 读取 | 用户资料和权限详情 |
| `opencli moyu tokens` | 读取 | 所有 Token 列表（余额、状态） |
| `opencli moyu token-key --token <名称>` | 读取 | 查看完整 API Key |
| `opencli moyu token-create --name <名称>` | 写入 | 创建新 Token |
| `opencli moyu token-delete --token <名称/ID>` | 写入 | 删除 Token |
| `opencli moyu token-enable --token <名称/ID>` | 写入 | 启用 Token |
| `opencli moyu token-disable --token <名称/ID>` | 写入 | 禁用 Token |
| `opencli moyu logs` | 读取 | 消费日志 |
| `opencli moyu models` | 读取 | 可用 AI 模型列表 |
| `opencli moyu groups` | 读取 | 模型分组及定价 |
| `opencli moyu redemption-list` | 读取 | 兑换码列表 |
| `opencli moyu redemption-create` | 写入 | 创建兑换码 |
| `opencli moyu redeem --code <兑换码>` | 写入 | 用兑换码充值 |

## 示例

```bash
# 查看余额
opencli moyu balance

# 查看 Token 列表
opencli moyu tokens

# 创建 ¥100 额度的 Token
opencli moyu token-create --name "我的项目" --quota 100

# 获取完整 API Key
opencli moyu token-key --token "我的项目"

# 查看最近消费日志
opencli moyu logs --limit 10 -f json
```

## 认证方式

通过浏览器 Cookie 认证，需要在 Chrome 中保持登录状态。
