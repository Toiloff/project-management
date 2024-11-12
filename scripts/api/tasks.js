import BaseAPI from "./base.js";

export default new (class TasksAPI extends BaseAPI {
  constructor() {
    super("/api/projects");
  }

  async get(id, options = {}) {
    return await this.request(`${this.prefix}/tasks.php?id=${id}`, options);
  }

  async getAllByProjectId(projectId, options = {}) {
    const data = await this.request(
      `${this.prefix}/tasks.php?project_id=${projectId}`,
      options
    );
    return data ? data : [];
  }

  async getAll(options = {}) {
    const data = await this.request(`${this.prefix}/tasks.php`, options);
    return data ? data : [];
  }

  async create(projectId, task, options = {}) {
    const { title, desc, category, priority, completed, ended_at } = task;
    return await this.request(
      `${this.prefix}/tasks.php?project_id=${projectId}`,
      {
        method: "POST",
        body: JSON.stringify({
          title,
          desc,
          category,
          priority,
          completed,
          ended_at,
        }),
        ...options,
      }
    );
  }

  async update(id, task, options = {}) {
    const { title, desc, category, priority, completed, ended_at } = task;

    return await this.request(`${this.prefix}/tasks.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title,
        desc,
        category,
        priority,
        completed,
        ended_at,
      }),
      ...options,
    });
  }

  async delete(id, options = {}) {
    const data = await this.request(`${this.prefix}/tasks.php?id=${id}`, {
      method: "DELETE",
      ...options,
    });

    return !!data;
  }
})();
