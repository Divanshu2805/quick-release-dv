const { test, expect } = require("@playwright/test");
exports.createproject = class Project {
  constructor(page) {
    this.page = page;
    this.Project = "New3";
  }

  async createproject() {
    await this.page.getByText("Open user menu").click();
    await this.page.getByText("Add new project").click();
    const projectInput = this.page.locator("#company-website");
    await projectInput.click();
    await projectInput.fill(this.Project);

    await expect(projectInput).toHaveValue(this.Project);
    await this.page.getByText("Save").click();
    // await this.page.getByText("Created Successfully").isVisible();
    await expect(this.page.locator("//div[@class='Toastify']")).toHaveText(
      "Created Successfully"
    );
  }

  async existproject() {
    await this.page.getByText("Open user menu").click();
    await this.page.getByText("Add new project").click();
    const projectInput = this.page.locator("#company-website");
    await projectInput.click();
    await projectInput.fill("testproject");

    await expect(projectInput).toHaveValue("testproject");
    await this.page.getByText("Save").click();
    // await this.page.getByText("Created Successfully").isVisible();
    await expect(this.page.locator("//div[@class='Toastify']")).toHaveText(
      "Project name is already taken"
    );

    await this.page.waitForTimeout(5000);
  }

  async projectvalidations() {
    await this.page.getByText("Open user menu").click();
    await this.page.getByText("Add new project").click();
    const projectInput = this.page.locator("#company-website");

    await projectInput.click();
    await projectInput.fill("   ");

    await this.page.getByText("Save").click();
    await expect(this.page.locator("#email-error")).toHaveText("Required");

    await this.page.waitForTimeout(5000);
  }
};