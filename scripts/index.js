import ProjectsAPI from "./api/projects.js";
import TasksAPI from "./api/tasks.js";

import { Project, Task } from "./models.js";
import { modal, toast } from "./utils.js";

class ProjectManagmentPage {
  constructor(rootEl, projectId = null) {
    this.rootEl = rootEl;
    this.projects = [];
    this.projectId = projectId;
    this.selectedProject = null;
    this.categoriesPhrases = {
      todo: "Запланировано",
      inprogress: "В процессе",
      inreview: "На рассмотрении",
      done: "Выполнено",
    };
    this.prioritiesPhrases = {
      high: "Высокий",
      medium: "Средний",
      low: "Низкий",
    };
  }

  async fetchProjects() {
    this.projects = await ProjectsAPI.getAll();
    return this;
  }

  async openProject() {
    const tasks = await TasksAPI.getAllByProjectId(this.projectId, {
      showToast: false,
    });
    const selectedProject = this.projects.find((p) => p.id === this.projectId);
    const { id, title } = selectedProject;
    this.selectedProject = new Project({
      id,
      title,
      tasks,
    });

    this.render();
    return this;
  }

  createProject = () => {
    const modalFormEl = document.createElement("form");
    modalFormEl.classList.add("modal-form");
    modalFormEl.id = "project-create";
    modalFormEl.method = "POST";
    modalFormEl.action = "/api/projects/index.php";

    const titleLabelEl = document.createElement("label");
    titleLabelEl.classList.add("modal-form__label-wrapper");
    titleLabelEl.setAttribute("for", "project-title");

    const titleInputEl = document.createElement("input");
    titleInputEl.classList.add("modal-form__text-input");
    titleInputEl.type = "text";
    titleInputEl.id = "project-title";
    titleInputEl.name = "title";
    titleInputEl.required = true;
    titleLabelEl.append("Название проекта", titleInputEl);

    const createButtonEl = document.createElement("button");
    createButtonEl.classList.add("button");
    createButtonEl.textContent = "Создать";

    modalFormEl.append(titleLabelEl, createButtonEl);
    const modalEl = modal(modalFormEl, "Создать новый проект");
    modalFormEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      modalEl.remove();
      const result = await ProjectsAPI.fetchByForm(modalFormEl);
      if (!result) {
        return;
      }

      toast("Проект успешно создан", "success", 5000);
      await this.fetchProjects();
      this.render();
    });
  };

  createTaskForm = (project, category) => {
    const modalFormEl = document.createElement("form");
    modalFormEl.classList.add("modal-form");
    modalFormEl.id = "task-create";
    modalFormEl._method = "POST";
    modalFormEl.action = `/api/projects/tasks.php?project_id=${project.id}`;

    const titleLabelEl = document.createElement("label");
    titleLabelEl.classList.add("modal-form__label-wrapper");
    titleLabelEl.setAttribute("for", "task-title");

    const titleInputEl = document.createElement("input");
    titleInputEl.classList.add("modal-form__text-input");
    titleInputEl.type = "text";
    titleInputEl.id = "task-title";
    titleInputEl.name = "title";
    titleInputEl.required = true;
    titleLabelEl.append("Название задачи", titleInputEl);

    const descLabelEl = document.createElement("label");
    descLabelEl.classList.add("modal-form__label-wrapper");
    descLabelEl.setAttribute("for", "task-desc");

    const descInputEl = document.createElement("input");
    descInputEl.classList.add("modal-form__text-input");
    descInputEl.type = "text";
    descInputEl.id = "task-desc";
    descInputEl.name = "desc";
    descLabelEl.append("Описание задачи (опционально)", descInputEl);

    const categoryLabelEl = document.createElement("label");
    categoryLabelEl.classList.add("modal-form__label-wrapper");
    categoryLabelEl.setAttribute("for", "task-category");

    // categoryHiddenInputEl.id = "task-category";
    // categoryHiddenInputEl.name = "category";
    // categoryHiddenInputEl.value = category;
    // categoryHiddenInputEl.hidden = true;
    const categorySelectEl = document.createElement("select");
    categorySelectEl.classList.add("modal-form__select");
    categorySelectEl.id = "task-category";
    categorySelectEl.name = "category";
    categorySelectEl.required = true;
    categorySelectEl.append(
      ...Task.categories.map((c) => {
        const optionEl = document.createElement("option");
        optionEl.value = c;
        optionEl.selected = c === category;
        optionEl.textContent = this.categoriesPhrases[c];
        return optionEl;
      })
    );

    categoryLabelEl.append("Категория задачи", categorySelectEl);

    const priorityLabelEl = document.createElement("label");
    priorityLabelEl.classList.add("modal-form__label-wrapper");
    priorityLabelEl.setAttribute("for", "task-priority");

    const prioritySelectEl = document.createElement("select");
    prioritySelectEl.classList.add("modal-form__select");
    prioritySelectEl.id = "task-priority";
    prioritySelectEl.name = "priority";
    prioritySelectEl.required = true;
    prioritySelectEl.append(
      ...Task.priorities.map((priority) => {
        const optionEl = document.createElement("option");
        optionEl.value = priority;
        optionEl.textContent = this.prioritiesPhrases[priority];
        return optionEl;
      })
    );
    priorityLabelEl.append("Приоритет задачи", prioritySelectEl);

    const completedLabelEl = document.createElement("label");
    completedLabelEl.classList.add("modal-form__label-wrapper");
    completedLabelEl.setAttribute("for", "task-completed");

    const completedCheckboxEl = document.createElement("input");
    completedCheckboxEl.classList.add("modal-form__checkbox-input");
    completedCheckboxEl.type = "checkbox";
    completedCheckboxEl.id = "task-completed";
    completedCheckboxEl.name = "completed";
    completedCheckboxEl.hidden = true;
    completedLabelEl.append("Задача выполнена?", completedCheckboxEl);

    const endedAtLabelEl = document.createElement("label");
    endedAtLabelEl.classList.add("modal-form__label-wrapper");
    endedAtLabelEl.setAttribute("for", "task-ended-at");

    const endedAtInputEl = document.createElement("input");
    endedAtInputEl.classList.add("modal-form__date-input");
    endedAtInputEl.type = "date";
    endedAtInputEl.id = "task-ended-at";
    endedAtInputEl.name = "ended_at";
    endedAtLabelEl.append("Дата завершения (опционально)", endedAtInputEl);

    const createButtonEl = document.createElement("button");
    createButtonEl.classList.add("button");
    createButtonEl.textContent = "Создать";
    createButtonEl.type = "submit";
    modalFormEl.append(
      titleLabelEl,
      descLabelEl,
      categoryLabelEl,
      priorityLabelEl,
      // позже заменить на completedLabelEl
      completedCheckboxEl,
      endedAtLabelEl,
      createButtonEl
    );

    return modalFormEl;
  };

  createTask = (project, category) => {
    const modalFormEl = this.createTaskForm(project, category, "POST");
    const modalEl = modal(modalFormEl, "Создать новую задачу");
    modalFormEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      modalEl.remove();
      const result = await TasksAPI.fetchByForm(modalFormEl);
      if (!result) {
        return;
      }

      toast("Задача успешно создана", "success", 5000);
      await this.openProject();
    });
  };

  updateTask = (project, task) => {
    const modalFormEl = this.createTaskForm(project, task.category);
    modalFormEl.id = "task-update";
    modalFormEl._method = "PUT";
    modalFormEl.action = `/api/projects/tasks.php?id=${task.id}`;

    const submitButtonEl = modalFormEl.querySelector(".button[type=submit]");
    submitButtonEl.textContent = "Изменить";
    const titleInputEl = modalFormEl.querySelector("#task-title");
    titleInputEl.value = task.title;

    const descInputEl = modalFormEl.querySelector("#task-desc");
    descInputEl.value = task.desc ?? "";

    const taskCategoryEl = modalFormEl.querySelector("#task-category");
    taskCategoryEl.value = task.category;

    const taskPriorityEl = modalFormEl.querySelector("#task-priority");
    taskPriorityEl.value = task.priority;

    const taskCompletedEl = modalFormEl.querySelector("#task-completed");
    taskCompletedEl.checked = task.completed;

    const taskEndedAtEl = modalFormEl.querySelector("#task-ended-at");
    taskEndedAtEl.value = task.ended_at.split(" ")[0];

    const modalEl = modal(modalFormEl, "Изменить задачу");
    modalFormEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      modalEl.remove();
      const result = await TasksAPI.fetchByForm(modalFormEl);
      if (!result) {
        return;
      }

      toast("Задача успешно изменена", "success", 5000);
      await this.openProject();
    });
  };

  deleteTask = (task) => {
    const modalFormEl = document.createElement("form");
    modalFormEl.classList.add("modal-form");
    modalFormEl.id = "task-delete";
    modalFormEl._method = "DELETE";
    modalFormEl.action = `/api/projects/tasks.php?id=${task.id}`;

    const createButtonEl = document.createElement("button");
    createButtonEl.classList.add("button", "button_danger");
    createButtonEl.textContent = "Удалить";
    createButtonEl.type = "submit";
    modalFormEl.append(createButtonEl);

    const modalEl = modal(modalFormEl, "Удалить задачу?");
    modalFormEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      modalEl.remove();
      const result = await TasksAPI.fetchByForm(modalFormEl);
      if (!result) {
        return;
      }

      toast("Задача успешно удалена", "success", 5000);
      await this.openProject();
    });
  };

  addEventListeners() {
    if (this.projectCreateButton) {
      return this;
    }

    this.projectCreateButton = this.rootEl.querySelector(
      ".project-create__button"
    );
    this.projectCreateButton.addEventListener("click", this.createProject);
    return this;
  }

  async init() {
    await this.fetchProjects();
    this.addEventListeners();
    this.projectId ? await this.openProject() : this.render();
    return this;
  }

  createKanbanTask = (category, task = null) => {
    const taskEl = document.createElement("li");
    taskEl.classList.add("kanban-list__item");

    const taskContentEl = document.createElement("article");
    taskContentEl.classList.add("kanban-content");

    if (task) {
      const taskUtilsEl = document.createElement("div");
      taskUtilsEl.classList.add("kanban-content__utils");

      const taskLabelEl = document.createElement("span");
      taskLabelEl.classList.add(
        "kanban-label",
        `kanban-label_${task.priority}`
      );
      taskLabelEl.textContent =
        this.prioritiesPhrases[task.priority] ?? task.priority;

      const taskDateEl = document.createElement("div");
      taskDateEl.classList.add("kanban-label", "kanban-date");
      const date = new Date(task.ended_at);
      const fullDate = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);

      taskDateEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24"><path fill="currentColor" d="M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V3q0-.425.288-.712T7 2t.713.288T8 3v1h8V3q0-.425.288-.712T17 2t.713.288T18 3v1h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5zM5 8h14V6H5zm0 0V6zm7 6q-.425 0-.712-.288T11 13t.288-.712T12 12t.713.288T13 13t-.288.713T12 14m-4 0q-.425 0-.712-.288T7 13t.288-.712T8 12t.713.288T9 13t-.288.713T8 14m8 0q-.425 0-.712-.288T15 13t.288-.712T16 12t.713.288T17 13t-.288.713T16 14m-4 4q-.425 0-.712-.288T11 17t.288-.712T12 16t.713.288T13 17t-.288.713T12 18m-4 0q-.425 0-.712-.288T7 17t.288-.712T8 16t.713.288T9 17t-.288.713T8 18m8 0q-.425 0-.712-.288T15 17t.288-.712T16 16t.713.288T17 17t-.288.713T16 18"></path></svg>${fullDate}`;

      // const moveButtonEl = document.createElement("button");
      // moveButtonEl.classList.add("button", "button_icon", "kanban-move");
      // moveButtonEl.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1m0 6a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1m0 6a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1"></path></svg>`;

      taskUtilsEl.append(taskLabelEl, taskDateEl);
      taskContentEl.appendChild(taskUtilsEl);
    }

    const taskBodyEl = document.createElement("div");
    taskBodyEl.classList.add("kanban-content__body");

    const taskTitleEl = document.createElement("h4");
    taskTitleEl.classList.add("kanban-content__title");
    taskTitleEl.textContent = task ? task.title : "Новая задача";

    const taskDescEl = document.createElement("p");
    taskDescEl.classList.add("kanban-content__desc");
    taskDescEl.textContent = task
      ? task.desc ?? ""
      : "Создайте новую задачу в рамках этого проекта";

    taskBodyEl.append(taskTitleEl, taskDescEl);

    const taskFooterEl = document.createElement("div");
    taskFooterEl.classList.add("kanban-content__footer");

    if (!task) {
      const createKanbanItemEl = document.createElement("button");
      createKanbanItemEl.classList.add("button", "kanban-content__button");
      createKanbanItemEl.textContent = "Создать новую задачу";
      createKanbanItemEl.addEventListener("click", () =>
        this.createTask(this.selectedProject, category)
      );
      taskFooterEl.append(createKanbanItemEl);
    }

    if (task) {
      //   <ul class="kanban-performers">
      //   <li class="kanban-performer">
      //     <img
      //       src="images/backgrounds/mountains-lake.jpg"
      //       alt="user1"
      //     />
      //   </li>
      //   <li class="kanban-performer">
      //     <img
      //       src="images/backgrounds/mountains-lake.jpg"
      //       alt="user1"
      //     />
      //   </li>
      //   <li class="kanban-performer">+5</li>
      // </ul>
      const editButtonEl = document.createElement("button");
      editButtonEl.classList.add(
        "button",
        "button_icon",
        "kanban-utils__button",
        "kanban-edit"
      );
      editButtonEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h6.525q.5 0 .75.313t.25.687t-.262.688T11.5 5H5v14h14v-6.525q0-.5.313-.75t.687-.25t.688.25t.312.75V19q0 .825-.587 1.413T19 21zm4-7v-2.425q0-.4.15-.763t.425-.637l8.6-8.6q.3-.3.675-.45t.75-.15q.4 0 .763.15t.662.45L22.425 3q.275.3.425.663T23 4.4t-.137.738t-.438.662l-8.6 8.6q-.275.275-.637.438t-.763.162H10q-.425 0-.712-.288T9 14m12.025-9.6l-1.4-1.4zM11 13h1.4l5.8-5.8l-.7-.7l-.725-.7L11 11.575zm6.5-6.5l-.725-.7zl.7.7z"/></svg>`;
      editButtonEl.addEventListener("click", () =>
        this.updateTask(this.selectedProject, task)
      );

      const deleteButtonEl = document.createElement("button");
      deleteButtonEl.classList.add(
        "button",
        "button_icon",
        "kanban-utils__button",
        "kanban-delete"
      );
      deleteButtonEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zm-7 11q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17M7 6v13z"/></svg>`;
      deleteButtonEl.addEventListener("click", () => this.deleteTask(task));
      taskFooterEl.append(editButtonEl, deleteButtonEl);
    }

    taskContentEl.append(taskBodyEl, taskFooterEl);
    taskEl.appendChild(taskContentEl);
    return taskEl;
  };

  createKanbanColumn = (category) => {
    const columnEl = document.createElement("li");
    columnEl.classList.add("kanban-column");
    columnEl.dataset.category = category;

    const columnHeaderEl = document.createElement("div");
    columnHeaderEl.classList.add("kanban-header");

    const columnHeaderTitleEl = document.createElement("h3");
    columnHeaderTitleEl.classList.add("kanban-header__title");
    columnHeaderTitleEl.textContent =
      this.categoriesPhrases[category] ?? category;

    const columnHeaderActionsEl = document.createElement("div");
    columnHeaderActionsEl.classList.add("kanban-header__actions");

    const createKanbanItemEl = document.createElement("button");
    createKanbanItemEl.classList.add(
      "button",
      "button_icon",
      "kanban-header__actions-item"
    );
    createKanbanItemEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"></path></svg>`;
    createKanbanItemEl.addEventListener("click", () =>
      this.createTask(this.selectedProject, category)
    );

    columnHeaderActionsEl.appendChild(createKanbanItemEl);
    columnHeaderEl.append(columnHeaderTitleEl, columnHeaderActionsEl);

    const tasks = this.selectedProject.tasks.filter(
      (task) => task.category === category
    );

    const kanbanListEl = document.createElement("ul");
    kanbanListEl.classList.add("kanban-list");
    tasks.length
      ? kanbanListEl.append(
          ...tasks.map((task) => this.createKanbanTask(category, task))
        )
      : kanbanListEl.appendChild(this.createKanbanTask(category, null));

    columnEl.append(columnHeaderEl, kanbanListEl);
    return columnEl;
  };

  createProjectContent() {
    this.projectContentEl = this.rootEl.querySelector(".project-content");
    if (!this.selectedProject) {
      const projectUnselectedEl = document.createElement("h2");
      projectUnselectedEl.classList.add("project-unselected");
      projectUnselectedEl.textContent = "Выберите один из ваших проектов";
      this.projectContentEl.innerHTML = "";
      this.projectContentEl.appendChild(projectUnselectedEl);
      return this;
    }

    this.projectTitleEl = document.createElement("h1");
    this.projectTitleEl.classList.add("project-title");
    this.projectTitleEl.textContent = this.selectedProject.title;

    this.kanbanEl = document.createElement("ul");
    this.kanbanEl.classList.add("kanban");
    this.kanbanEl.append(...Task.categories.map(this.createKanbanColumn));
    this.projectContentEl.innerHTML = "";
    this.projectContentEl.append(this.projectTitleEl, this.kanbanEl);
    return this;
  }

  updateAvailableProjects() {
    this.availableProjectsEl = this.rootEl.querySelector(".projects-list");
    if (!this.projects.length) {
      this.availableProjectsEl.innerHTML = "";
      return this;
    }

    const projectItemEls = this.projects.map((project) => {
      const projectItemEl = document.createElement("li");
      projectItemEl.classList.add("project-list__item");
      if (project.id === this.selectedProject?.id) {
        projectItemEl.ariaCurrent = "page";
      }

      const projectItemLinkEl = document.createElement("a");
      projectItemLinkEl.classList.add("project-list__item-link");
      projectItemLinkEl.href = `#project=${project.id}`;
      projectItemLinkEl.textContent = project.title;
      projectItemLinkEl.addEventListener("click", async (e) => {
        e.preventDefault();
        this.projectId = project.id;
        await this.openProject();
      });
      projectItemEl.appendChild(projectItemLinkEl);

      return projectItemEl;
    });

    this.availableProjectsEl.innerHTML = "";
    this.availableProjectsEl.append(...projectItemEls);

    return this;
  }

  render() {
    this.updateAvailableProjects();
    this.createProjectContent();
    return this;
  }
}

async function init() {
  const rootEl = document.querySelector(".container");
  const params = new URLSearchParams(window.location.hash.substring(1));
  const projectId = +params.get("projectId");

  const page = new ProjectManagmentPage(
    rootEl,
    projectId > 0 ? projectId : null
  );
  await page.init();
}

await init();
