import BaseAPI from "./base.js";

export default new (class ProjectsAPI extends BaseAPI {
  constructor() {
    super("/api/projects");
  }

  async get(id, options = {}) {
    return await this.request(`${this.prefix}/index.php?id=${id}`, options);
  }

  async getAll(options = {}) {
    const data = await this.request(`${this.prefix}/index.php`, options);
    return data ? data : [];
  }

  async create(id, title, options = {}) {
    return await this.request(`${this.prefix}/index.php?id=${id}`, {
      method: "POST",
      body: JSON.stringify({
        title,
      }),
      ...options,
    });
  }

  async update(id, title, options = {}) {
    return await this.request(`${this.prefix}/index.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title,
      }),
      ...options,
    });
  }

  async delete(id, options = {}) {
    const data = await this.request(`${this.prefix}/index.php?id=${id}`, {
      method: "DELETE",
      ...options,
    });

    return !!data;
  }
})();
