---
name: specreview
description: Multi-role code review for code changes — runs code, logic, spec, perf, dep, security, and test checks against modified files.
license: MIT
compatibility: Requires openspec CLI and openspec/changes/ directory structure.
metadata:
  author: specreview
  version: "1.0"
---

# specreview — 多角色代码审查

**触发方式：** `/specreview <spec-name>`

对某个 OpenSpec change 涉及的所有代码文件，从多个角色视角进行全面的代码审查。

---

## 工作流程

### Step 1：解析输入

从用户消息中提取 `<spec-name>`：

- `/specreview change-table` → spec 名称 = `change-table`
- 如果没有提供 spec 名称，使用 **AskUserQuestion** 询问："想 review 哪个 spec？请输入 OpenSpec change 名称（如 `change-table`）"

### Step 2：定位 Spec 目录

读取 OpenSpec change 目录：

```
openspec/changes/{spec-name}/
├── proposal.md       → "Impact" 段落列出了所有受影响文件
├── design.md         → 技术决策和架构设计
└── tasks.md          → 具体任务和改动细节
```

如果目录不存在，告知用户该 spec 不存在，提示先运行 `/opsx:propose` 创建它。

### Step 3：识别受影响的源文件

从 spec 文件中提取文件列表：
1. **proposal.md 的 "Impact" 段落** — 主要文件清单
2. **tasks.md** — 每个任务涉及的具体文件
3. **design.md** — 模块/文件结构和数据流中提到的文件

列出所有受影响的源文件（排除 openspec/ 目录自身的文档），按项目实际使用的语言/框架类型识别。

### Step 4：读取源文件

读取每个受影响文件的完整内容。同时也读取与改动相关的上下游文件（如调用方、被调用方、依赖的模块定义等），确保理解上下文。

### Step 5：多角色审查

读取 `specreview/config/config.yaml` 获取所有角色及其优先级顺序。

使用 **TodoWrite** 跟踪审查进度。

按 priority 升序，对每个角色：

1. 读取 `specreview/config/{role}.md` 文件，获取检查标准
2. 根据角色的检查要点审查源文件
3. 生成结构化审查输出，格式：

```markdown
### [角色名]

| 文件 | 行号 | 问题描述 | 严重程度 | 建议 |
|------|------|----------|----------|------|
| ...  | ...  | ...      | high/mid/low | ...  |
```

零问题则注明「全部通过 ✅」。

### Step 6：汇总报告

将所有角色的审查结果编译为最终报告，包含：

```
┌──────────────────────────────────────────────┐
│           specreview 审查报告                  │
│           Spec: change-table                  │
│           审查日期: 2026-05-05                 │
├──────────────────────────────────────────────┤
│                                              │
│  受影响文件: file1.js, file2.py, ...         │
│                                              │
│  ┌─ 代码审查员 ────────────────────────────┐ │
│  │  通过 ✅                                  │ │
│  └──────────────────────────────────────────┘ │
│  ┌─ 逻辑审查员 ────────────────────────────┐ │
│  │  2 个问题 (1 high, 1 low)                 │ │
│  └──────────────────────────────────────────┘ │
│  ... (更多角色)                                │
│                                              │
│  ★ 重点行动项:                                │
│  1. [高] file.py:12 — 集合越界风险            │
│  2. [中] ...                                  │
└──────────────────────────────────────────────┘
```

### Step 7：输出结果

向用户展示完整审查报告。如果发现问题，询问是否需要自动修复。

---

## 角色列表

| 角色 | 文件 | 优先级 | 关注领域 |
|------|------|--------|----------|
| 代码审查员 | `specreview/config/code-check.md` | 10 | 可读性、命名、DRY、注释、代码风格 |
| 逻辑审查员 | `specreview/config/logic-check.md` | 20 | 边界条件、分支覆盖、循环终止、状态流转 |
| 需求审查员 | `specreview/config/spec-check.md` | 25 | 需求覆盖、范围控制、设计偏差 |
| 性能审查员 | `specreview/config/perf-check.md` | 30 | N+1、循环耗时操作、资源释放 |
| 依赖审查员 | `specreview/config/dep-check.md` | 40 | 依赖必要性、版本兼容、安全漏洞 |
| 安全审查员 | `specreview/config/security-check.md` | 60 | 注入防护、敏感信息、权限校验 |
| 测试审查员 | `specreview/config/test-check.md` | 70 | 异常捕获、超时重试、日志记录、降级策略 |

---

## 审查原则

- **只审查改动区域**，不审查整个项目
- **客观表述**，基于代码事实，不主观臆断
- **严重程度分级**：high（必须修复）/ mid（建议修复）/ low（仅供参考）
- **零问题 = 通过**，不需要编造发现
- **需求审查**是最重要的角色——代码必须满足需求规格
