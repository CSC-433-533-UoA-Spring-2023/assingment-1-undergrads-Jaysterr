
// returns true if number is between min (inclusive) and max (exclusive)
function inRange(num, min, max) {
    return min <= num && num < max;
}

// Converts an angle in degrees to radians and returns it
function Deg2Rad(deg) {
    return deg * Math.PI / 180;
}


// Returns the basic rotation matrix given an angle in degrees
function GetRotationMatrixDeg(angle){
    var rad = angle * Math.PI / 180;
    var cos = Math.cos(rad);
    var sin = Math.sin(rad);
    return [
        [cos, -sin, 0],
        [sin,  cos, 0],
        [0,    0,   1]
    ];
}

// Returns the basic rotation matrix given an angle in radians
function GetRotationMatrixRad(rad){
    var cos = Math.cos(rad);
    var sin = Math.sin(rad);
    return [
        [cos, -sin, 0],
        [sin,  cos, 0],
        [0,    0,   1]
    ];
}

// Returns a Translation matrix given an x and y translation
function GetTranslationMatrix(x, y) {
    return [
        [1, 0, x],
        [0, 1, y],
        [0, 0, 1]
    ];
}

// Returns a scaling matrix given an x and y scale
function GetScalingMatrix(x, y) {
    return [
        [x, 0, 0],
        [0, y, 0],
        [0, 0, 1]
    ];
}

// Returns a uniform matrix given a scale value
function GetUniformScalingMatrix(s) {
    return [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, s]
    ];
}

// Multiplys an nxm matrix by an mx1 vector, returning an nx1 vector
function MultiplyMatrixVector(m, v) {
    const result = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            result[i] += m[i][j] * v[j];
        }
    }
    return result;
}

// Multiplys two 3x3 matrices, returning an 3x3 matrix
function MultiplyMatrixMatrix(m1, m2) {
    var res = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

    var i, j, k;
    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            for (k = 0; k < 3; k++) {
                res[i][j] += m1[i][k] * m2[k][j];
            }
        }
    }

    return res;
}

// Addition of two matrices
function AddMatrixMatrix(m1, m2) {
    var rows=m1.length;
    var columns=m1[0].length;

    var res = Array(rows).fill().map(() => Array(columns));
    for(let i=0;i<rows;i++){
        for(let j=0;j<columns;j++){
            res[i][j]=m1[i][j] + m2[i][j];
        }
    }

    return res;
}

// Inverse a 3x3 matrix
function InverseMatrix3x3(matrix) {
    if (matrix.length !== 3 || matrix[0].length !== 3) {
        throw new Error("Input must be a 3x3 matrix");
    }

    const [a, b, c] = matrix[0];
    const [d, e, f] = matrix[1];
    const [g, h, i] = matrix[2];

    // Calculate determinant
    const determinant = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    if (determinant === 0) {
        throw new Error("Matrix is singular and cannot be inverted");
    }

    // Compute inverse using the adjugate matrix divided by determinant
    const inverse = [
        [(e * i - f * h) / determinant, (c * h - b * i) / determinant, (b * f - c * e) / determinant],
        [(f * g - d * i) / determinant, (a * i - c * g) / determinant, (c * d - a * f) / determinant],
        [(d * h - e * g) / determinant, (b * g - a * h) / determinant, (a * e - b * d) / determinant]
    ];

    return inverse;
}

// Inverse a 4x4 matrix
function InverseMatrix4x4(matrix) {
    if (matrix.length !== 4 || matrix[0].length !== 4) {
        throw new Error("Input must be a 4x4 matrix");
    }

    function getCofactor(m, row, col) {
        return m.filter((_, i) => i !== row)
                .map(r => r.filter((_, j) => j !== col));
    }

    function determinant4x4(m) {
        let det = 0;
        for (let i = 0; i < 4; i++) {
            const subMatrix = getCofactor(m, 0, i);
            const sign = i % 2 === 0 ? 1 : -1;
            det += sign * m[0][i] * determinant3x3(subMatrix);
        }
        return det;
    }

    function determinant3x3(m) {
        return (
            m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
            m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
            m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
        );
    }

    const det = determinant4x4(matrix);
    if (det === 0) {
        throw new Error("Matrix is singular and cannot be inverted");
    }

    let adjugate = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cofactor = getCofactor(matrix, i, j);
            const sign = (i + j) % 2 === 0 ? 1 : -1;
            adjugate[j][i] = sign * determinant3x3(cofactor);
        }
    }
    
    const inverse = adjugate.map(row => row.map(value => value / det));
    return inverse;
}

// Transpose a matrix
function Transpose(matrix) {
     var rows=matrix.length;
     var columns=matrix[0].length;
     var transposed = Array(rows).fill().map(() => Array(columns));
     for(let i=0;i<rows;i++){
         for(let j=0;j<columns;j++){
             transposed[j][i]=matrix[i][j];
         }
     }
     return transposed
}

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static fromArray = (arr) => {
        return new Vec2(arr[0], arr[1]);
    }

    clamp = (lower, upper) => {
        let x = this.x;
        let y = this.y; 

        if (this.x < lower) x = lower;
        else if (this.x > upper) x = upper;

        if (this.y < lower) y = lower;
        else if (this.y > upper) y = upper;

        return new Vec2(x, y);
    }

    scale = (scalar) => {
        this.x *= scalar;
        this.y *= scalar;
    }

    scaled = (scalar) => {
        return new Vec2(scalar * this.x, scalar * this.y);
    }

    plus = (other) => {
        return new Vec2(this.x + other.x, this.y + other.y);
    }

    static add = (v1, v2) => {
        return new v1.plus(v2);
    }

    minus = (other) => {
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    static subtract = (v1, v2) => {
        return v1.minus(v2);
    }

    neg = () => {
        this.x = -this.x;
        this.y = -this.y;
    }

    inverse = () => {
        return new Vec2(-this.x, -this.y);
    }

    dot = (other) => {
        return this.x * other.x + this.y * other.y;
    }

    normSq = () => {
        return this.x * this.x + this.y * this.y;
    }

    norm = () => {
        return Math.sqrt(this.normSq());
    }

    normalized = () => {
        const norm = this.norm();
        return new Vec2(this.x / norm, this.y / norm);
    }

    dist = (other) => {
        return this.minus(other).norm();
    }

    static distance = (v1, v2) => {
        return v1.dist(v2);
    }

    equals = (other) => {
        return this.x === other.x && this.y === other.y;
    }

    static equal = (v1, v2) => {
        return v1.eq(v2);
    }

    str = () => {
        return `(${this.x}, ${this.y})`;
    }

    static zero = () => {
        return new Vec2(0, 0);
    }

    static unitNorm = (v) => {
        const tolerance = 0.0001;
        return Math.abs(v.normSq() - 1) < tolerance;
    }

}


class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static fromArray = (arr) => {
        return new Vec3(arr[0], arr[1], arr[2]);
    }

    clamp = (lower, upper) => {
        let x = this.x;
        let y = this.y; 
        let z = this.z;
        if (this.x < lower) x = lower;
        else if (this.x > upper) x = upper;

        if (this.y < lower) y = lower;
        else if (this.y > upper) y = upper;

        if (this.z < lower) z = lower;
        else if (this.z > upper) z = upper;

        return new Vec3(x, y, z);
    }

    toArray = () => {
        return [this.x,this.y,this.z];
    }

    toRgba = () => {
        return Rgba.fromArray(this.toArray());
    }

    scale = (scalar) => {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    scaled = (scalar) => {
        return new Vec3(scalar * this.x, scalar * this.y, scalar * this.z);
    }

    plus = (other) => {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    static add = (v1, v2) => {
        return new v1.plus(v2);
    }

    minus = (other) => {
        return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    static subtract = (v1, v2) => {
        return v1.minus(v2);
    }

    neg = () => {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
    }

    inverse = () => {
        return new Vec3(-this.x, -this.y, -this.z);
    }

    dot = (other) => {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    cross = (other) => {
        return new Vec3(this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x);
    }

    normSq = () => {
        return this.dot(this);
    }

    norm = () => {
        return Math.sqrt(this.normSq());
    }

    normalized = () => {
        const norm = this.norm();
        return new Vec3(this.x / norm, this.y / norm, this.z / norm);
    }

    dist = (other) => {
        return this.minus(other).norm();
    }

    static distance = (v1, v2) => {
        return v1.dist(v2);
    }

    equals = (other) => {
        return this.x === other.x && this.y === other.y && this.z === other.z;
    }

    static equal = (v1, v2) => {
        return v1.eq(v2);
    }

    str = () => {
        return `(${this.x}, ${this.y}, ${this.z})`;
    }

    static zero = () => {
        return new Vec3(0, 0, 0);
    }

    static unitNorm = (v) => {
        const tolerance = 0.0001;
        return Math.abs(v.normSq() - 1) < tolerance;
    }
}