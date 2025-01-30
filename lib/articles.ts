export interface Article {
  slug: string
  title: string
  description: string
  content: string
  date: string
  readingTime: string
  author: {
    name: string
    image: string
  }
}

export const articles: Article[] = [
  {
    slug: 'understanding-chaos-chess',
    title: 'Understanding Chaos Chess: A New Way to Play',
    description: 'Learn about the unique mechanics and strategies of Chaos Chess, where news events influence the game in real-time.',
    content: `
Chaos Chess introduces a revolutionary twist to the classic game of chess by incorporating real-world news events that directly affect the game board. Unlike traditional chess, where pieces move according to strict rules, Chaos Chess adds an element of unpredictability through news-driven effects.

## Core Mechanics

1. **News Integration**
Every game starts by selecting two public figures. The system then analyzes recent news about these individuals, creating dynamic effects that influence the game.

2. **Chaos Effects**
- **Piece Multiplication**: Positive news can cause pieces to duplicate
- **Piece Vanishing**: Negative news might make pieces disappear
- **Random Moves**: Neutral news can cause spontaneous piece movement
- **Piece Swapping**: Some effects can swap piece positions

## Strategic Considerations

Playing Chaos Chess requires a different mindset than traditional chess:

- Plan for uncertainty
- Maintain piece redundancy
- Adapt to sudden board changes
- Balance traditional strategy with chaos management

The key to success is embracing the unpredictability while maintaining strategic flexibility.
    `.trim(),
    date: '2024-01-30',
    readingTime: '5 min',
    author: {
      name: 'Alex Chen',
      image: '/authors/alex.jpg'
    }
  },
  {
    slug: 'mastering-news-effects',
    title: 'Mastering News Effects in Chaos Chess',
    description: 'Deep dive into the various news effects and how to use them to your advantage.',
    content: `
      News effects are the heart of Chaos Chess, transforming a traditional chess game into an unpredictable battle of adaptation. Understanding how to leverage these effects can be the difference between victory and defeat.

      ## Types of Effects

      ### Positive News Effects
      When positive news appears, pieces can multiply. This creates opportunities for:
      - Building stronger defensive positions
      - Creating unexpected attacking combinations
      - Developing backup pieces for critical positions

      ### Negative News Effects
      Negative news causes pieces to vanish, requiring:
      - Protective positioning of key pieces
      - Maintaining distance between important pieces
      - Building redundant defensive structures

      ### Neutral News Effects
      Random moves can occur with neutral news, leading to:
      - Unexpected tactical opportunities
      - Forced position reassessment
      - New strategic considerations

      ## Tactical Considerations

      1. **Timing Matters**
      - Watch the chaos timer
      - Plan moves considering upcoming effects
      - Use effects to disrupt opponent plans

      2. **Position Management**
      - Keep kings in protected positions
      - Maintain flexible piece formations
      - Create backup defensive structures

      3. **Adaptation Strategies**
      - Quick position evaluation
      - Flexible game plans
      - Multiple winning paths
    `,
    date: '2024-01-31',
    readingTime: '7 min',
    author: {
      name: 'Sarah Johnson',
      image: '/authors/sarah.jpg'
    }
  },
  {
    slug: 'advanced-chaos-strategies',
    title: 'Advanced Strategies for Chaos Chess',
    description: 'Expert-level tactics and strategies for winning at Chaos Chess.',
    content: `
      Success in Chaos Chess requires a unique blend of traditional chess knowledge and chaos management skills. This guide explores advanced strategies for experienced players.

      ## Advanced Concepts

      ### 1. Multi-Layer Planning
      Unlike traditional chess, planning in Chaos Chess must account for:
      - Primary strategy execution
      - Backup plans for piece loss
      - Opportunity exploitation from chaos effects
      - Position recovery tactics

      ### 2. Risk Management
      Managing risk becomes crucial when chaos effects can dramatically alter the board:
      - Distribute important pieces
      - Maintain multiple attack vectors
      - Create redundant defensive structures
      - Plan for worst-case scenarios

      ### 3. Chaos Timing
      Understanding the timing of chaos effects can provide strategic advantages:
      - Coordinate attacks with upcoming effects
      - Prepare defensive positions before negative effects
      - Use effect timing to pressure opponents

      ## Winning Strategies

      1. **Control Through Chaos**
      - Use chaos effects to create controlled disorder
      - Force opponents into unfamiliar positions
      - Maintain flexibility in piece positioning

      2. **Adaptive Development**
      - Develop pieces with multiple purposes
      - Create fluid pawn structures
      - Maintain king safety through redundancy

      3. **Psychology of Chaos**
      - Embrace unpredictability
      - Stay calm during dramatic board changes
      - Use chaos to induce opponent mistakes
    `,
    date: '2024-02-01',
    readingTime: '10 min',
    author: {
      name: 'Dr. Marcus Wei',
      image: '/authors/marcus.jpg'
    }
  }
] 