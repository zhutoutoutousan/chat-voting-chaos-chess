# 🌪️ Chaos Chess

Welcome to Chaos Chess - where traditional chess meets real-time chaos! Experience a revolutionary take on the classic game where world events dynamically influence your gameplay.

![Chaos Chess Preview](public/preview.gif)

## 🎮 Features

### 🌊 Dynamic Gameplay
- **Real-time News Integration**: Live news events trigger special effects on the board
- **Adaptive Strategy**: React to changing conditions and evolve your gameplay
- **Chaotic Elements**: Experience unpredictable board transformations

### 🎯 Core Mechanics
- **News-Driven Effects**: Real-world events influence piece movements and board states
- **Dynamic Rule Changes**: Game rules evolve based on current events
- **Visual Chaos**: Stunning visual effects reflect the game's chaotic nature

### 🏆 Competitive Features
- **Global Rankings**: Compete with players worldwide
- **Adaptability Score**: Unique rating system based on handling chaos
- **Achievement System**: Unlock achievements for mastering chaotic situations

## 🚀 Getting Started
Clone the repository
```bash
git clone https://github.com/yourusername/chaos-chess.git
```
Install dependencies
```bash
pnpm install
```
Start the development server
```bash
pnpm dev
```
Build for production
```bash
pnpm build
```


## 🧪 Testing

### Unit Tests
We use Jest and React Testing Library for comprehensive unit testing:

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

Key test suites:
- `ChessGame.test.tsx`: Core game mechanics
- `NewsEffects.test.tsx`: News integration effects
- `ChaosRules.test.tsx`: Dynamic rule changes
- `GameState.test.tsx`: State management
- `Animations.test.tsx`: Visual effects

### End-to-End Tests
We use Playwright for end-to-end testing across multiple browsers:

```bash
# Install Playwright browsers
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run specific browser tests
pnpm test:e2e:chrome
pnpm test:e2e:firefox
pnpm test:e2e:safari
```

E2E test scenarios:
- Complete game flows
- Multiplayer interactions
- News effect triggers
- Authentication flows
- Responsive design
- Performance metrics

### Testing Philosophy
- **Coverage Target**: Maintain >80% code coverage
- **Visual Regression**: Automated screenshot comparisons
- **Performance Testing**: Lighthouse CI integration
- **Accessibility Testing**: Automated a11y checks
- **Cross-browser Testing**: Support for Chrome, Firefox, Safari
- **Mobile Testing**: Responsive design verification
- **Load Testing**: WebSocket connection stress tests

### CI/CD Pipeline
```yaml
# Test stages in our CI pipeline
stages:
  - lint
  - unit-test
  - e2e-test
  - performance
  - deploy
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **3D Graphics**: Three.js, React Three Fiber
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Real-time Updates**: WebSocket
- **Authentication**: Clerk
- **News Integration**: Custom News API

## 🎨 Design Philosophy

Chaos Chess combines the strategic depth of traditional chess with the unpredictability of real-world events. The design emphasizes:

- **Visual Chaos**: Stunning effects that don't compromise gameplay clarity
- **Responsive Design**: Seamless experience across all devices
- **Accessibility**: Chaos that's readable and navigable
- **Performance**: Optimized animations and effects

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Mobile app version
- [ ] AI opponents affected by chaos
- [ ] Tournament system
- [ ] Custom chaos events
- [ ] Social features
- [ ] Replay system

## 🌟 Special Thanks

Thanks to all contributors and the chess community for embracing chaos!

---

<p align="center">
  Made with 💜 and a touch of chaos
</p>