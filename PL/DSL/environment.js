class Environment {
  constructor(parent = null) {
    this.vars = new Map();
    this.parent = parent;
  }

  get(name) {
    if (this.vars.has(name)) return this.vars.get(name);
    if (this.parent) return this.parent.get(name);
    throw new Error(`Undefined variable: '${name}'`);
  }

  set(name, value) {
    this.vars.set(name, value);
    return value;
  }

  assign(name, value) {
    if (this.vars.has(name)) {
      this.vars.set(name, value);
      return value;
    }
    if (this.parent) return this.parent.assign(name, value);
    throw new Error(`Cannot assign to undefined variable: '${name}'`);
  }
}

module.exports = Environment;