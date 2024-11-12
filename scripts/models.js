export class Task {
  static categories = ["todo", "inprogress", "inreview", "done"];
  static priorities = ["high", "medium", "low"];

  static validateCategory(category) {
    return !category || !Task.categories.includes(category);
  }
  static validatePriority(priority) {
    return !priority || !Task.priorities.includes(priority);
  }

  constructor({
    id,
    title,
    desc,
    category,
    priority,
    completed,
    endedAt,
    createdAt,
  }) {
    if (
      !id ||
      !title ||
      !Task.validateCategory(category) ||
      !Task.validatePriority(priority) ||
      typeof completed !== "boolean"
    ) {
      throw new Error("Failed to create a task, because not enough data");
    }

    this.id = id;
    this.title = title;
    this.desc = desc;
    this.category = category;
    this.priority = priority;
    this.completed = completed;
    this.endedAt = endedAt;
    this.createdAt = createdAt;
  }
}

export class Project {
  constructor({ id, title, tasks }) {
    if (!id || !title) {
      console.log(!id, !title);
      throw new Error("Failed to create a project, because not enough data");
    }

    this.id = id;
    this.title = title;
    this.tasks = tasks;
  }
}
