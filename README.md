# 画笔勇者：25次冒险 · CloudBase 上海版

React 19 + Vite 8 + TypeScript；CloudBase 身份认证 V2、文档型数据库、传统云存储与 Node.js 云函数。保留女勇者、五张差异化地图、动画、冒险信箱、图鉴、成长对比和倒计时，不依赖 ChatGPT 登录。

**目标环境：`yongzhe-shuihenzao-d1cb0b673cc3f`，地域：`ap-shanghai`。**

这是可本地验证、待腾讯云真实环境验收的迁移版本。尚未开通/购买资源，未向正式环境写入数据，未替换原 Sites 部署。先完成文末验收，再决定上线。

## 1. GitHub、静态托管与 Publishable Key

GitHub 保存源码；CloudBase 静态网站托管连接 GitHub 后构建页面。数据库、登录、原图和奖励由同一个 CloudBase 环境处理。GitHub Pages 也可以提供静态页面，但不能独立保存跨设备数据；本项目默认以大陆访问为目标部署到 CloudBase 上海。

**本项目不需要 Publishable Key。** SDK 使用环境 ID 初始化，以匿名会话提供只读浏览，使用账号密码登录后由服务端角色授权写入。Publishable Key 是另一种公开资源访问方式，不是服务器管理密钥，也不必为了本项目创建它。

相关官方文档：[初始化与可选 accessKey](https://docs.cloudbase.net/api-reference/webv2/initialization)、[身份认证](https://docs.cloudbase.net/api-reference/webv2/authentication)、[静态托管](https://docs.cloudbase.net/hosting/web-hosting)。SDK 主版本 3 与控制台的“身份认证 V2”不是同一个版本编号；项目固定 JS SDK 3.10.1。

## 2. 本地启动和检查

推荐 Node.js 22.13 或更新的 22.x，使用 npm 和已提交的 `package-lock.json`。

```sh
npm ci
npm test
npm run build
npm run dev
```

打开 `http://127.0.0.1:5175/`。默认本地后端复用正式业务逻辑，数据位于被 Git 忽略的 `.local/database.json` 与 `.local/storage/`；初始为 **0/25**。不会读取、删除或修改旧工程的数据库。测试账号 `hero` / `admin` 共用本机随机密码，首次启动生成在 `.local/access.json`，仅供本机预览。不要把这个文件提交、截图或部署到云端。本地开发服务器只接受 `127.0.0.1`、同源请求和 HttpOnly 会话。

构建后的 `dist/` 只使用 CloudBase；`npm run preview` 是生产产物预览，需先完成腾讯云配置。不能把本地测试后端部署到线上。构建检查会拒绝测试后端、服务器凭证、信件正文和源映射出现在 Web 产物中。

联调云环境：将 `.env.example` 复制为 `.env.local`，设置 `VITE_BACKEND=cloudbase`，重启开发服务。此模式的上传会写入配置的真实环境，只在隔离测试环境使用。

## 3. 项目结构与数据流

| 路径 | 用途 |
| --- | --- |
| `src/main.tsx`、`vite.config.ts` | 标准 React SPA 入口与生产构建 |
| `src/cloudbase.ts`、`src/api.ts` | 按需加载的 SDK、身份认证、云函数调用与上传 |
| `components/`、`styles/`、`app/globals.css` | 保留的游戏界面、五张地图、动画、手机布局 |
| `public/fonts/` | 本地像素字体、OFL 授权与版权说明 |
| `cloudfunctions/quest-api/` | 服务端权限、图片验证、缩略图、事务与奖励逻辑 |
| `cloudfunctions/quest-api/quest.config.json` | 25 关和全部金额配置，绝不打进前端 |
| `cloudbase/*.rules.json` | 数据库与传统云存储规则 |
| `scripts/cloudbase-data.mjs` | 初始化、包含图片的备份、向新环境恢复 |
| `tests/cloudbase.test.mjs` | 本地业务集成、权限、并发、图片验证测试 |
| `docs/上线验收清单.md` | 本地证据与云端待验收项目 |
| `README.sites.md`、`drizzle/`、`lib/server.ts` | 旧部署说明和原始迁移参考；CloudBase 构建不使用 |

所有 DB 变更均通过 `quest-api`，禁止客户端直写。服务端从 CloudBase 可信上下文取 UID，不信任请求里的 UID 或 role。

画作流程：准备上传票据 → SDK 上传原图至暂存区 → 云函数检查归属、有效期、大小、SHA-256、真实图片格式和像素数 → 保存原图及 720px 内 WebP 缩略图 → 数据库事务提交作品与里程碑。原图字节保持不变。相同文件禁止重复；同一请求重试只计数一次；并发提交旧进度会被拒绝。图片替换有版本校验，避免覆盖另一台设备的编辑。

每个冒险只有 25 张作品；进度、奖励、最多 20 封信在一个有界文档中事务更新。角色、上传票据与旧版本归档独立保存。删除只允许最后一张，奖励历史保留，图片及元数据进入归档，不自动永久删除。

## 4. 需要你在腾讯云控制台操作

以下步骤需要你的账号权限，本工程没有代替你完成授权或购买。

1. 登录 [CloudBase 控制台](https://tcb.cloud.tencent.com/)，确认上述环境确实在 **上海**，使用文档型数据库与传统云存储。不要选择 PG/RLS 模式；如果现有环境只有 PG 模式，先停在这里，需调整适配而不是套用本规则。
2. 按控制台提示完成账号实名认证。查看现有套餐/额度是否已包含数据库、云函数、存储、静态托管；若出现购买或升级要求，先评估，不要自动开通收费选项。
3. 在身份认证 V2 启用“匿名登录”和“用户名/密码登录”。匿名身份只用于浏览，无权上传和开箱。关闭不需要的自助注册，或确保注册用户始终无角色。
4. 在用户管理创建勇者账号与发起人账号，密码由你自己填写、保管。记下各自 **UID**，不要使用邮箱、用户名或昵称代替 UID，不要给匿名用户管理员角色。
5. 在安全来源/安全域名添加本地 `http://127.0.0.1:5175`（按控制台要求拆分域名及端口），以及最终托管 HTTPS 域名。不要使用 `*`。
6. 创建下列四个文档型集合；每个集合设置 `cloudbase/database.rules.json` 的规则（客户端读写都禁止）：`quest_state`、`quest_roles`、`quest_uploads`、`quest_archive`。
7. 云存储权限设置为自定义，粘贴 `cloudbase/storage.rules.json`。规则只允许非匿名、active、hero/admin 写自己的暂存文件；正式原图及缩略图只能由云函数写。原图浏览通过服务端短时签名链接。
8. 部署 `quest-api` 云函数，配置见下一节。使用环境运行身份，不在代码或浏览器中配置 SecretId/SecretKey。给函数运行角色本环境文档数据库和云存储所需权限；不要开放 HTTP 免鉴权触发器。
9. 完成下面的数据初始化和角色配置；用控制台规则模拟器验证访客/普通账号/勇者/发起人的允许与拒绝场景。
10. 开启已有静态托管能力，完成 GitHub 仓库访问授权与 SPA 配置。自定义域名、HTTPS 和域名备案按控制台要求由你完成；未配置前可先用控制台分配的测试域名验收。

安全规则传播可能有延迟，保存后再做规则验收。不能因为上传失败临时改成“所有人可写”。真实环境规则解释器、账号认证及运行角色权限必须在云端实测。

## 5. 初始化 0/25；导入真实两张作品

**不要用初始化操作覆盖已有记录。** 当前默认不导入测试图，不伪造两张作品。

```sh
npm run cloudbase:config
```

这个命令只生成 `.local/cloudbase-initial-state.json`，不会访问云端。在空环境的 `quest_state` 导入该 JSON，文档 ID 必须是 `main`。出现同名文档时停止，不覆盖。

在 `quest_roles` 中分别创建文档，ID 使用你核对过的账户 UID：

```json
{ "_id": "勇者账号的真实UID", "role": "hero", "active": true }
```

```json
{ "_id": "发起人账号的真实UID", "role": "admin", "active": true }
```

角色只能通过受信任控制台管理。撤权将 `active` 改为 `false`；下次请求立即拒绝写入。前端没有自助升级管理员入口。

也可在受信任终端用临时云 API 凭据执行 `npm run cloudbase:init`：通过终端环境变量提供 `TCB_ENV`、`QUEST_CONFIRM_ENV`、`TCB_SECRET_ID`、`TCB_SECRET_KEY`，临时凭据还需 `TCB_SESSION_TOKEN`。环境确认值必须与目标 ID 完全一致。脚本只初始化空集合，不创建/授权账号。不要在聊天中发送凭据，不要加 `VITE_` 前缀，不提交到 Git。

登录网站发起人账号 → 冒险信箱管理 → 历史作品导入。按真实创作顺序导入两张原图及实际日期，成功后依次显示 1/25、2/25。第三张通过正常“继续冒险”上传后解锁第 3 关礼物；金额在亲手开启后才显示。

奖励配置保持：3→100、5→150、10→200、15→250、20→350、25→450，合计 **1500 元**。开启不代表转账，发起人只能在实际完成网站外转账后登记发放。同一奖励不能重复发放。修改配置只影响未来空环境初始化；已有奖励金额不会被新部署悄悄改写，若需迁移金额要另外备份、审查迁移。

## 6. 部署：GitHub 连接优先

GitHub 源码仓库为 `DoctorDaddd/shuihenzao`，部署源分支为 `main`。本地迁移分支为 `cloudbase-shanghai`；迁移工程远程 `github` 指向 GitHub，`sites-source` 指向旧本地工程。源码同步与正式上线分别验收：旧 Sites 部署、数据及原工程的 Git 配置保持不变，CloudBase 完成验收后再切换正式访问入口。

在 CloudBase“静态网站托管”选择从 GitHub 部署，授权仅访问需要的仓库：

| 设置 | 值 |
| --- | --- |
| 分支 | `main`（部署前核对待验收的 commit） |
| 根目录 | `/` |
| Node.js | 22.x（至少 22.13） |
| 安装命令 | `npm ci` |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| 环境 ID | `VITE_CLOUDBASE_ENV_ID=yongzhe-shuihenzao-d1cb0b673cc3f` |
| 地域 | `VITE_CLOUDBASE_REGION=ap-shanghai` |
| 云函数名 | `VITE_CLOUDBASE_FUNCTION=quest-api` |

不要在生产设置 `VITE_BACKEND=local`。环境 ID 是公开标识；SecretId、SecretKey、管理员密码不能加入前端构建变量。默认环境 ID 同时在 `cloudbaserc.json` 声明，迁移到别的测试环境必须同时核对前端和云函数部署目标。

**GitHub 静态构建只发布页面，不会自动发布云函数或安全规则。** 先部署并验证后端，再发布前端；不要误以为推送代码就完成整个系统上线。

控制台设置：首页 `index.html`；SPA history fallback 将非文件路由重写到 `/index.html`，状态码 200。若只提供错误页设置，填 `index.html` 并验证 `/admin` 刷新能进入页面，同时记录实际 HTTP 状态。静态资源缺失应是 404，不能让 API/图片路径全部返回 HTML。

缓存建议：`/assets/*` 文件名含 hash，可设置一年 immutable；`/index.html` 及 SPA 回退页面设 no-cache；本地字体可长缓存并在替换时改文件名。API 与个人登录状态不缓存。当前没有 Service Worker，避免旧壳层挡住新版本。默认保留上一版本资源一段时间，避免已打开的旧页面懒加载失败。

## 7. 本地 CLI 部署方案

只在你完成控制台授权、确认资源及验收目标之后执行：

```sh
npx @cloudbase/cli@3.8.5 login
npx @cloudbase/cli@3.8.5 fn deploy quest-api -e yongzhe-shuihenzao-d1cb0b673cc3f
npm ci
npm test
npm run build
npx @cloudbase/cli@3.8.5 hosting deploy ./dist -e yongzhe-shuihenzao-d1cb0b673cc3f
```

云函数 `cloudbaserc.json` 指定 Nodejs20.19、60 秒、512MB、云端安装依赖。部署时上传函数源码和函数自己的 `package-lock.json`，不要上传本机 Windows `node_modules`；`sharp` 必须在 Linux 云端安装对应原生包。部署目标地域始终为上海。命令不会替你设置角色、规则或购买资源。若 CLI 登录失败/未实名认证/托管未开通，回控制台处理，不降级权限。

建议在首次正式部署前，复制配置到隔离测试环境执行整份验收清单。本项目没有自动生产发布工作流。

## 8. 大陆访问、图片与手机端

- 字体和图形在项目内；地图用 SVG/CSS，SDK 随构建打包。运行时不请求 Google Fonts、海外图片 CDN 或 ChatGPT 服务。
- 首页主脚本与 CloudBase SDK 分包加载；列表与悬浮预览使用缩略图，打开详情/对比才加载原图，列表懒加载并异步解码。
- 云端图片以短时签名 URL 访问，页面可见时每分钟及返回窗口时同步状态，续期图片链接。离线/服务失败显示错误，不把失败伪装为保存成功。
- 沿用现有手机布局、触屏交互及减少动画偏好。小屏实际浏览器仍需在云端验收。
- 目标上海托管与存储能减少对境外服务的依赖；最终可用性仍需用大陆移动/电信/联通网络实测，不能只凭本机访问就保证全国可用。

## 9. 备份与回滚

日常管理界面“导出元数据备份”包含作品信息、奖励历史、信件，不包含图片。完整备份使用受信任终端的临时云 API 凭据：

```sh
npm run cloudbase:backup
# TCB_ENV 指向待备份环境；命令只读云端，写入本机 cloudbase-backups/。
```

完整备份包含当前及归档画作的原图/缩略图、四个集合、来源环境、SHA-256 校验清单。备份时暂停编辑；若修订号变化，脚本报错并不生成完成清单。只有含 `manifest.json` 且所有图片校验通过的目录才算完整备份。把整个目录加密保存到独立介质；不要提交 Git。用户账号/密码由 CloudBase 身份服务管理，不在本备份中。

恢复只支持**另一个空环境**，不覆盖正式数据：

```sh
npm run cloudbase:restore -- /绝对路径/完整备份目录
```

设置新环境 `TCB_ENV`，`QUEST_CONFIRM_ENV` 必须相同；先创建四个空集合并配置拒绝客户端访问。脚本先验证全部本地文件，再上传图片并重写 fileID，在事务中恢复进度/奖励/信件/归档。不迁移账号权限及过期上传票据；在目标环境重新创建并核对账号、设置角色后再开放访问。恢复失败可能留下未引用图片，但不会删除来源或覆盖原数据。

前端回滚：部署上一个通过验收的 Git 版本产物，并保留相应资源。后端回滚：部署与当前数据库 schemaVersion 兼容的旧函数版本。数据库恢复：新环境完整恢复并验收，之后再切换前端环境 ID。不能直接将有数据的正式环境重置为 0。

旧 Sites 的源码、D1/R2 数据和部署仍保留在原工程 `../brush-quest`；该目录是本次迁移的回退来源。`README.sites.md` 是历史部署说明，不是当前 CloudBase 的启动方法。

## 10. 错误、安全日志及上线前检查

函数只记录 action、UID 的不可逆短摘要、成功/失败与错误码，不记录密码、令牌、信件、原图或签名 URL。控制台使用云函数请求日志定位失败。预期输入/权限错误返回中文说明，内部异常返回通用错误；不吞掉服务故障。前端无法从构建文件中获得服务端奖励金额配置或未解锁信件。

安全边界验收以实际 CloudBase 为准：数据库四集合全部客户端读写拒绝；云存储普通/匿名账号写入拒绝；hero 无法写正式目录/改角色/编辑信件/登记发放；admin 也只能通过校验后的云函数执行业务操作。公开浏览意味着作品和已解锁信件可被访客看到，与现有“任何人可访问”要求一致。

完整验收步骤见 [上线验收清单](docs/上线验收清单.md)。只有本地测试通过不能宣称腾讯云部署或跨设备同步已验证。

### 首次访问出现“无法读取登录状态，请重新登录”

SDK 3.10.1 在浏览器没有登录凭据时，`getSession()` 会返回 `unauthenticated`。旧版前端在此处提前退出，未执行访客登录。本版本只针对这一状态建立匿名会话；已有账号会话保持不变，网络或权限错误仍会阻止请求。部署修复后的构建产物，并刷新页面；不要通过清空数据库或放宽安全规则解决。

若随后出现“暂时无法连接冒险世界”，在目标环境核对匿名登录已启用、当前网站域名已加入安全来源，并按控制台提示等待配置生效。真实账号写入仍需正确的勇者/管理员角色。前端成功登录后若冒险服务仍不可用，继续核对 `quest-api` 云函数、四个集合及初始化记录是否已部署。
