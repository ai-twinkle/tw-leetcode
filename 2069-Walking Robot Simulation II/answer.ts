const DIRECTION_NAMES: readonly string[] = ['East', 'North', 'West', 'South'];

class Robot {
  private readonly perimeter: number;
  private readonly lookupX: Int16Array;
  private readonly lookupY: Int16Array;
  private readonly lookupDir: Uint8Array;
  private pos: number;
  private hasMoved: boolean;

  /**
   * @param width  Grid width (2 ≤ width ≤ 100)
   * @param height Grid height (2 ≤ height ≤ 100)
   */
  constructor(width: number, height: number) {
    const perimeter = 2 * (width + height - 2);
    this.perimeter = perimeter;
    this.pos = 0;
    this.hasMoved = false;

    this.lookupX = new Int16Array(perimeter);
    this.lookupY = new Int16Array(perimeter);
    this.lookupDir = new Uint8Array(perimeter);

    // Segment 1: bottom edge, facing East (y=0, x: 0→width-1), length = width
    for (let x = 0; x < width; x++) {
      this.lookupX[x] = x;
      this.lookupY[x] = 0;
      this.lookupDir[x] = 0; // East
    }

    // Segment 2: right edge, facing North (x=width-1, y: 1→height-1), length = height-1
    for (let i = 0; i < height - 1; i++) {
      const index = width + i;
      this.lookupX[index] = width - 1;
      this.lookupY[index] = 1 + i;
      this.lookupDir[index] = 1; // North
    }

    // Segment 3: top edge, facing West (y=height-1, x: width-2→0), length = width-1
    // Top-left corner [0, height-1] is the LAST cell of this segment (still facing West)
    const topEdgeStart = width + height - 1;
    for (let i = 0; i < width - 1; i++) {
      const index = topEdgeStart + i;
      this.lookupX[index] = width - 2 - i;
      this.lookupY[index] = height - 1;
      this.lookupDir[index] = 2; // West
    }

    // Segment 4: left edge, facing South (x=0, y: height-2→1), length = height-2
    // Does NOT include [0, height-1] (that's West) or [0, 0] (that's East/South via hasMoved)
    const leftEdgeStart = 2 * width + height - 2;
    for (let i = 0; i < height - 2; i++) {
      const index = leftEdgeStart + i;
      this.lookupX[index] = 0;
      this.lookupY[index] = height - 2 - i;
      this.lookupDir[index] = 3; // South
    }
  }

  /**
   * @param num Number of steps to move forward
   */
  step(num: number): void {
    this.hasMoved = true;
    this.pos = (this.pos + num) % this.perimeter;
  }

  /**
   * @return Current [x, y] position of the robot
   */
  getPos(): number[] {
    return [this.lookupX[this.pos], this.lookupY[this.pos]];
  }

  /**
   * @return Current direction the robot is facing
   */
  getDir(): string {
    // pos 0 after a full loop means the robot arrived heading South
    if (this.pos === 0 && this.hasMoved) {
      return 'South';
    }

    return DIRECTION_NAMES[this.lookupDir[this.pos]];
  }
}

/**
 * Your Robot object will be instantiated and called as such:
 * var obj = new Robot(width, height)
 * obj.step(num)
 * var param_2 = obj.getPos()
 * var param_3 = obj.getDir()
 */
