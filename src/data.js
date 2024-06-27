const data = [
    {
        id: 1,
        type: 'object',
        position: { x: 10, y: 20 },
        velocity: 2.5,
        direction: 'north',
        isMoving: true,
        confidence: 0.85,
        timestamp: Date.now() // initial timestamp
    },
    {
        id: 2,
        type: 'object',
        position: { x: 50, y: 30 },
        velocity: 3.2,
        direction: 'south',
        isMoving: false,
        confidence: 0.92,
        timestamp: Date.now() + 2000 // 2 seconds later
    },
    {
        id: 3,
        type: 'object',
        position: { x: 80, y: 15 },
        velocity: 1.8,
        direction: 'east',
        isMoving: true,
        confidence: 0.78,
        timestamp: Date.now() + 4000 // 4 seconds later
    },
    {
        id: 4,
        type: 'object',
        position: { x: 30, y: 70 },
        velocity: 4.5,
        direction: 'west',
        isMoving: false,
        confidence: 0.88,
        timestamp: Date.now() + 6000 // 6 seconds later
    },
    {
        id: 5,
        type: 'object',
        position: { x: 60, y: 50 },
        velocity: 2.1,
        direction: 'north',
        isMoving: true,
        confidence: 0.91,
        timestamp: Date.now() + 8000 // 8 seconds later
    }
];


export default data