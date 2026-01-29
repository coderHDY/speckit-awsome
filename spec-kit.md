## 1. 环境初始化 (Initialize) 
Spec-kit 是一个基于 Python 的 CLI 工具。您需要先在终端中初始化项目： 
```sh
# 建议使用 uv (Python 包管理器) 安装并运行
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init <项目名称>
# 本项目
specify init .
```
注意：在初始化时，AI 助手会自动在项目中生成 .specify/ 目录，用于存储后续的模板和记忆文件。 
## 2. 建立宪法 (Constitution) —— 注入 Figma 与日语规范 
这是项目的核心规则集。在 AI 聊天界面（如 Copilot Chat）中使用指令： 
- 操作：执行 /speckit.constitution。
- 说明：在此步骤中，您应明确：
- 语言规范：所有生成的文档和代码注释必须使用日语。
- 式样规范：强制遵循特定的 Figma Design Tokens（如间距、颜色变量）。
- 技术栈：React (Front) + Node.js/Express (Back) + MongoDB (DB)。 
## 3. 编写规格 (Specify) —— “WHAT” 阶段
- 使用 /speckit.specify 命令描述具体的功能需求。 
- 做法：您可以先用中文描述需求。
- 产出：Spec-kit 会自动在 spec/ 文件夹下生成一个 日语版本 的 spec.md。这份文档描述了“要做什么”以及预期的业务逻辑，满足您对日语文档的需求。 
## 4. 细化与计划 (Clarify & Plan) —— “HOW” 阶段
- 澄清：执行 /speckit.clarify。AI 会主动提问以消除歧义（例如响应式断点的具体像素值）。
- 计划：执行 /speckit.plan。AI 会根据规格书生成技术实现计划 plan.md，确定如何布局 MongoDB 和 React 组件结构。 
## 5. 任务分解与实现 (Tasks & Implement)
- 任务化：执行 /speckit.tasks。将计划分解为具体的可执行任务列表 tasks.md。
- 实现：根据任务列表逐项编写代码。此时，由于有了前面的日语 Spec 和 Plan 作为上下文，Copilot 生成的代码字段和逻辑将严格对齐您的日语要求。 