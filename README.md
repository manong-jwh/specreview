# specreview

多角色代码审查技能 —— 为 AI 编程助手（Claude Code、Cursor 等）添加 `/specreview` 命令，对使用OpenSpec框架下的指定 spec 涉及的代码变更进行多维度审查。

## 安装

```bash
npm install -g specreview
```

## 使用

在项目目录执行 init：

```bash
cd your-project
specreview init
```

也可以指定 AI 工具：

```bash
specreview init --tools claude,cursor
```

init 会在项目中生成：

```
.claude/skills/specreview/SKILL.md   # Claude Code 自动注册 /specreview
specreview/config/                    # 配置 + 角色定义
```

然后在 Claude Code 中使用：

```
/specreview <spec-name>
```

例如审查 `change-table` 这个 OpenSpec change：

```
/specreview change-table
```

AI 会自动定位 `openspec/changes/change-table/` 目录，读取 spec 文档和改动的源文件，依次从 7 个角色视角进行审查并汇总报告。

## 角色说明

| 角色       | 关注领域                               |
| ---------- | -------------------------------------- |
| 代码审查员 | 可读性、命名、DRY、注释、代码风格      |
| 逻辑审查员 | 边界条件、分支覆盖、循环终止、状态流转 |
| 需求审查员 | 需求覆盖、范围控制、设计偏差           |
| 性能审查员 | N+1、循环耗时操作、资源释放            |
| 依赖审查员 | 依赖必要性、版本兼容、安全漏洞         |
| 安全审查员 | 注入防护、敏感信息、权限校验           |
| 测试审查员 | 异常捕获、超时重试、日志记录、降级策略 |

所有角色均为语言无关的通用检查。如需添加语言特定检查（TypeScript 类型断言、Rust 生命周期等），编辑 `specreview/config/config.yaml` 在自定义区域添加即可。

## 自定义

1. 在 `specreview/config/` 下新建 `.md` 文件，定义检查标准
2. 在 `specreview/config/config.yaml` 中添加角色条目
3. 设 `enabled: true` 即可生效

## 许可证

MIT
