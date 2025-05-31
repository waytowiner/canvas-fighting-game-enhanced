# 贡献指南 / Contributing Guide

感谢您对Canvas Fighting Game Enhanced Edition项目的关注！我们欢迎所有形式的贡献。

## 🤝 如何贡献 / How to Contribute

### 报告问题 / Reporting Issues

如果您发现了bug或有功能建议，请：

1. 检查是否已有相关issue
2. 创建新的issue，包含：
   - 清晰的标题和描述
   - 重现步骤（如果是bug）
   - 期望的行为
   - 实际的行为
   - 浏览器和操作系统信息
   - 截图或录屏（如果适用）

### 提交代码 / Submitting Code

1. **Fork项目**
   ```bash
   git clone https://github.com/yourusername/canvas-fighting-game-enhanced.git
   cd canvas-fighting-game-enhanced
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **开发和测试**
   ```bash
   npm run dev  # 启动开发服务器
   ```

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add new feature" # 使用约定式提交
   ```

6. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建Pull Request**

## 📝 代码规范 / Code Standards

### TypeScript 规范

```typescript
// ✅ 好的例子
interface GameConfig {
  width: number;
  height: number;
  fps: number;
}

class GameEngine {
  private config: GameConfig;
  
  constructor(config: GameConfig) {
    this.config = config;
  }
  
  public start(): void {
    // 实现逻辑
  }
}

// ❌ 避免的例子
var game = {
  w: 800,
  h: 600
};
```

### 命名约定

- **文件名**: kebab-case (`language-manager.ts`)
- **类名**: PascalCase (`LanguageManager`)
- **变量/函数**: camelCase (`getCurrentLanguage`)
- **常量**: UPPER_SNAKE_CASE (`DEFAULT_LANGUAGE`)
- **接口**: PascalCase with 'I' prefix (`ITranslations`)

### 注释规范

```typescript
/**
 * 语言管理器类，负责处理多语言功能
 * Language manager class for handling multilingual features
 */
class LanguageManager {
  /**
   * 获取指定键的翻译文本
   * Get translated text for the specified key
   * @param key - 翻译键 / Translation key
   * @param params - 参数对象 / Parameters object
   * @returns 翻译后的文本 / Translated text
   */
  getText(key: string, params?: Record<string, string>): string {
    // 实现逻辑
  }
}
```

## 🌐 国际化贡献 / Internationalization Contributions

### 添加新语言

1. 在 `src/language-manager.ts` 中添加新的翻译对象：

```typescript
const translations = {
  zh: { /* 中文翻译 */ },
  en: { /* 英文翻译 */ },
  ja: { /* 日文翻译 - 新增 */ }
};
```

2. 确保所有翻译键都有对应的翻译
3. 测试语言切换功能
4. 更新README中的支持语言列表

### 翻译质量要求

- 保持术语一致性
- 考虑文化差异
- 保持简洁明了
- 测试UI布局适应性

## 🎮 游戏功能贡献 / Game Feature Contributions

### 添加新角色

1. 准备角色资源：
   ```
   assets/characters/new-character/
   ├── idle.png
   ├── walk.png
   ├── attack.png
   └── preview.png
   ```

2. 在 `src/characters/` 中创建角色类：
   ```typescript
   export class NewCharacter extends Character {
     constructor() {
       super({
         name: 'newCharacter',
         health: 100,
         speed: 5,
         // 其他属性
       });
     }
   }
   ```

3. 更新角色列表和翻译

### 添加新功能

遵循现有的架构模式：
- 使用TypeScript类型
- 实现适当的错误处理
- 添加国际化支持
- 保持代码模块化

## 🧪 测试 / Testing

### 手动测试清单

- [ ] 游戏启动正常
- [ ] 角色选择功能正常
- [ ] 语言切换功能正常
- [ ] 战斗系统正常
- [ ] 音效播放正常
- [ ] 响应式设计正常
- [ ] 浏览器兼容性测试

### 测试不同场景

```bash
# 开发环境测试
npm run dev

# 生产构建测试
npm run build
npm run preview
```

## 📋 提交信息规范 / Commit Message Convention

使用[约定式提交](https://www.conventionalcommits.org/)格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 类型 / Types

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `i18n`: 国际化相关

### 示例 / Examples

```
feat(i18n): add Japanese language support

fix(game): resolve character selection bug

docs: update contributing guidelines

i18n(zh): improve Chinese translations for UI elements
```

## 🎨 UI/UX 贡献 / UI/UX Contributions

### 设计原则

- 保持简洁明了的界面
- 确保良好的可访问性
- 支持响应式设计
- 保持一致的视觉风格

### CSS 规范

```css
/* 使用BEM命名约定 */
.language-switch {
  /* 块级元素样式 */
}

.language-switch__button {
  /* 元素样式 */
}

.language-switch__button--active {
  /* 修饰符样式 */
}
```

## 🔍 代码审查 / Code Review

### 审查要点

- 代码是否遵循项目规范
- 功能是否正确实现
- 是否有潜在的性能问题
- 是否添加了适当的注释
- 是否考虑了国际化
- 是否保持向后兼容性

## 📚 学习资源 / Learning Resources

### 技术栈相关

- [TypeScript官方文档](https://www.typescriptlang.org/docs/)
- [Vite官方文档](https://vitejs.dev/)
- [Canvas API文档](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### 游戏开发

- [HTML5 Game Development](https://developer.mozilla.org/en-US/docs/Games)
- [Canvas游戏开发教程](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript)

## 🏆 贡献者认可 / Contributor Recognition

我们会在以下地方认可贡献者：

- README.md 贡献者列表
- 发布说明中的特别感谢
- 项目网站（如果有）

## 📞 联系方式 / Contact

如果您有任何问题或建议，可以通过以下方式联系：

- 创建GitHub Issue
- 发起GitHub Discussion
- 发送邮件（如果提供）

## 📄 许可证 / License

通过贡献代码，您同意您的贡献将在与项目相同的许可证下发布。

---

**感谢您的贡献！** 🎉

每一个贡献，无论大小，都让这个项目变得更好。我们期待与您一起构建更棒的游戏体验！