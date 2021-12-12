export class State {
  constructor(name, key, icon) {
    this.name = name;
    this.key = key;
    this.icon = icon;
  }

  toParameter(full = true, paramName = 'role') {
    return `${paramName}=${full ? this.name : this.name[0]}`;
  }
}

export const types = {
  TEACHER: new State('teacher', 'state.teacher', 'user-tie'),
  STUDENT: new State('student', 'state.student', 'user-graduate'),
  ASSISTANT: new State('assistant', 'state.assistant', 'hands-helping'),
};

export const { TEACHER, STUDENT, ASSISTANT } = types;
