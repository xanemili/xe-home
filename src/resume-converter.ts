// resume-converter.ts
// Node.js script for converting HTML resume to markdown and PDF

// External dependencies (add these to your package.json):
// npm install jsdom pdfkit
// npm install @types/node @types/jsdom @types/pdfkit (for TypeScript)

import { JSDOM } from "jsdom";
import * as fs from "fs";
import * as path from "path";
import PDFDocument from "pdfkit";

interface ResumeSection {
    title: string;
    content: string;
}

interface ExperienceItem {
    title: string;
    company: string;
    duration: string;
    description: string[];
    projects?: ProjectItem[];
}

interface ProjectItem {
    title: string;
    techStack: string;
    description: string[];
}

interface SkillCategory {
    category: string;
    skills: string;
}

class ResumeConverter {
    private resumeContainer: Element;
    private htmlFilePath: string;
    private outputDir: string;

    constructor(htmlFilePath: string, outputDir: string = ".") {
        this.htmlFilePath = htmlFilePath;
        this.outputDir = outputDir;

        // Read and parse HTML file
        const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");
        const dom = new JSDOM(htmlContent);
        const container = dom.window.document.getElementById("resume-content");

        if (!container) {
            throw new Error(
                `Container with id 'resume-content' not found in ${htmlFilePath}`,
            );
        }
        this.resumeContainer = container;
    }

    /**
     * Convert HTML resume to Markdown format
     * @returns {string} Markdown formatted resume
     */
    public convertToMarkdown(): string {
        const markdown: string[] = [];

        // Header section
        const header = this.resumeContainer.querySelector(".header");
        if (header) {
            const name = header.querySelector("h1")?.textContent || "";
            const title = header.querySelector(".title")?.textContent || "";

            markdown.push(`# ${name}`);
            markdown.push("");
            markdown.push(`**${title}**`);
            markdown.push("");

            // Contact info
            const contactLinks = header.querySelectorAll(".contact-info a");
            const contacts: string[] = [];
            contactLinks.forEach((link: Element) => {
                const href = (link as HTMLAnchorElement).href;
                const text = link.textContent || "";
                if (href.startsWith("mailto:")) {
                    contacts.push(`**Email:** ${text}`);
                } else {
                    contacts.push(`[${text}](${href})`);
                }
            });

            if (contacts.length > 0) {
                markdown.push(contacts.join(" | "));
                markdown.push("");
            }
        }

        // Process each section
        const sections = this.resumeContainer.querySelectorAll(".section");
        sections.forEach((section: Element) => {
            const sectionTitle =
                section.querySelector(".section-title")?.textContent || "";
            markdown.push(`## ${sectionTitle.toUpperCase()}`);
            markdown.push("");

            // Handle different section types
            switch (sectionTitle.toLowerCase()) {
                case "skills":
                    this.processSkillsSection(section, markdown);
                    break;
                case "experience":
                    this.processExperienceSection(section, markdown);
                    break;
                case "personal projects":
                    this.processProjectsSection(section, markdown);
                    break;
                case "certifications":
                    this.processCertificationsSection(section, markdown);
                    break;
                case "education":
                    this.processEducationSection(section, markdown);
                    break;
                default:
                    this.processGenericSection(section, markdown);
            }

            markdown.push("");
        });

        return markdown.join("\n");
    }

    /**
     * Process skills section
     */
    private processSkillsSection(section: Element, markdown: string[]): void {
        const skillCategories = section.querySelectorAll(".skill-category");
        skillCategories.forEach((category: Element) => {
            const categoryTitle =
                category.querySelector("h4")?.textContent || "";
            const skills = category.querySelector("p")?.textContent || "";
            markdown.push(`**${categoryTitle}:** ${skills}`);
        });
    }

    /**
     * Process experience section
     */
    private processExperienceSection(
        section: Element,
        markdown: string[],
    ): void {
        const experienceItems = section.querySelectorAll(".experience-item");
        experienceItems.forEach((item: Element) => {
            const jobTitle =
                item.querySelector(".job-title")?.textContent || "";
            const company = item.querySelector(".company")?.textContent || "";
            const duration = item.querySelector(".duration")?.textContent || "";

            markdown.push(`### **${company} | ${jobTitle} | ${duration}**`);

            // Main job description
            const mainUl = item.querySelector(".job-description > ul");
            if (mainUl) {
                const listItems = mainUl.querySelectorAll("li");
                listItems.forEach((li: Element) => {
                    markdown.push(`- ${li.textContent?.trimStart()}`);
                });
            }

            // Projects within the job
            const projects = item.querySelectorAll(".project");
            projects.forEach((project: Element) => {
                const projectTitle =
                    project.querySelector(".project-title")?.textContent || "";
                const techStack =
                    project.querySelector(".tech-stack")?.textContent || "";

                markdown.push(`- **${projectTitle}** *(${techStack})*`);

                const projectItems = project.querySelectorAll("li");
                projectItems.forEach((li: Element) => {
                    markdown.push(`  - ${li.textContent?.trimStart()}`);
                });
            });

            markdown.push("");
        });
    }

    /**
     * Process projects section
     */
    private processProjectsSection(section: Element, markdown: string[]): void {
        const projects = section.querySelectorAll(".project");
        projects.forEach((project: Element) => {
            const projectTitle =
                project.querySelector(".project-title")?.textContent || "";
            const techStack =
                project.querySelector(".tech-stack")?.textContent || "";

            markdown.push(`### **${projectTitle}** *(${techStack?.trim()})*`);

            const projectItems = project.querySelectorAll("li");
            projectItems.forEach((li: Element) => {
                markdown.push(`- ${li.textContent?.trim()}`);
            });
        });
    }

    /**
     * Process certifications section
     */
    private processCertificationsSection(
        section: Element,
        markdown: string[],
    ): void {
        const certifications = section.querySelectorAll(".certification");
        certifications.forEach((cert: Element) => {
            const title = cert.querySelector(".cert-title")?.textContent || "";
            const date = cert.querySelector(".cert-date")?.textContent || "";
            markdown.push(`**${title}** - ${date}`);
        });
    }

    /**
     * Process education section
     */
    private processEducationSection(
        section: Element,
        markdown: string[],
    ): void {
        const education = section.querySelectorAll(".education");
        education.forEach((edu: Element) => {
            const title = edu.querySelector(".edu-title")?.textContent || "";
            const date = edu.querySelector(".edu-date")?.textContent || "";
            markdown.push(`**${title}** - ${date}`);
        });
    }

    /**
     * Process generic section
     */
    private processGenericSection(section: Element, markdown: string[]): void {
        const content = section.textContent || "";
        markdown.push(content);
    }

    /**
     * Save the markdown content to a file
     */
    public saveMarkdown(): void {
        const markdownContent = this.convertToMarkdown();
        const outputPath = path.join(
            this.outputDir,
            "Alexander_Emili_Resume.md",
        );
        fs.writeFileSync(outputPath, markdownContent, "utf-8");
        console.log(`Markdown saved to: ${outputPath}`);
    }

    /**
     * Generate and save PDF using PDFKit
     */
    public savePDF(): void {
        try {
            const outputPath = path.join(
                this.outputDir,
                "Alexander_Emili_Resume.pdf",
            );

            const doc = new PDFDocument({
                size: "A4",
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
            });

            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Header section
            const header = this.resumeContainer.querySelector(".header");
            if (header) {
                const name = header.querySelector("h1")?.textContent || "";
                const title = header.querySelector(".title")?.textContent || "";

                doc.fontSize(24)
                    .font("Helvetica-Bold")
                    .text(name, { align: "center" });
                doc.moveDown(0.5);
                doc.fontSize(14)
                    .font("Helvetica")
                    .text(title, { align: "center" });
                doc.moveDown(0.5);

                // Contact info
                const contactLinks = header.querySelectorAll(".contact-info a");
                const contacts: string[] = [];
                contactLinks.forEach((link: Element) => {
                    const text = link.textContent || "";
                    contacts.push(text);
                });

                if (contacts.length > 0) {
                    doc.fontSize(10).text(contacts.join(" | "), {
                        align: "center",
                    });
                }
                doc.moveDown(1);
                doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
                doc.moveDown(1);
            }

            // Process each section
            const sections = this.resumeContainer.querySelectorAll(".section");
            sections.forEach((section: Element, index: number) => {
                const sectionTitle =
                    section.querySelector(".section-title")?.textContent || "";

                // Section title
                doc.fontSize(14)
                    .font("Helvetica-Bold")
                    .text(sectionTitle.toUpperCase());
                doc.moveDown(0.3);
                doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
                doc.moveDown(0.5);

                // Handle different section types
                switch (sectionTitle.toLowerCase()) {
                    case "skills":
                        this.addSkillsSectionToPDF(section, doc);
                        break;
                    case "experience":
                        this.addExperienceSectionToPDF(section, doc);
                        break;
                    case "personal projects":
                        this.addProjectsSectionToPDF(section, doc);
                        break;
                    case "certifications":
                        this.addCertificationsSectionToPDF(section, doc);
                        break;
                    case "education":
                        this.addEducationSectionToPDF(section, doc);
                        break;
                    default:
                        this.addGenericSectionToPDF(section, doc);
                }

                doc.moveDown(0.5);
            });

            doc.end();

            stream.on("finish", () => {
                console.log(`PDF saved to: ${outputPath}`);
            });
        } catch (error) {
            console.error("Error generating PDF:", error);
            throw error;
        }
    }

    private addSkillsSectionToPDF(
        section: Element,
        doc: typeof PDFDocument.prototype,
    ): void {
        const skillCategories = section.querySelectorAll(".skill-category");
        skillCategories.forEach((category: Element) => {
            const categoryTitle =
                category.querySelector("h4")?.textContent || "";
            const skills = category.querySelector("p")?.textContent || "";
            doc.fontSize(10)
                .font("Helvetica-Bold")
                .text(`${categoryTitle}: `, { continued: true });
            doc.font("Helvetica").text(skills);
            doc.moveDown(0.3);
        });
    }

    private addExperienceSectionToPDF(
        section: Element,
        doc: typeof PDFDocument.prototype,
    ): void {
        const experienceItems = section.querySelectorAll(".experience-item");
        experienceItems.forEach((item: Element) => {
            const jobTitle =
                item.querySelector(".job-title")?.textContent || "";
            const company = item.querySelector(".company")?.textContent || "";
            const duration = item.querySelector(".duration")?.textContent || "";

            doc.fontSize(11)
                .font("Helvetica-Bold")
                .text(`${company} | ${jobTitle}`, { continued: true });
            doc.font("Helvetica").text(` | ${duration}`);
            doc.moveDown(0.3);

            // Main job description
            const mainUl = item.querySelector(".job-description > ul");
            if (mainUl) {
                const listItems = mainUl.querySelectorAll("li");
                listItems.forEach((li: Element) => {
                    doc.fontSize(9)
                        .font("Helvetica")
                        .text(`• ${li.textContent}`, {
                            indent: 10,
                            paragraphGap: 3,
                        });
                });
            }

            // Projects within the job
            const projects = item.querySelectorAll(".project");
            projects.forEach((project: Element) => {
                const projectTitle =
                    project.querySelector(".project-title")?.textContent || "";
                const techStack =
                    project.querySelector(".tech-stack")?.textContent || "";

                doc.fontSize(9)
                    .font("Helvetica-Bold")
                    .text(`• ${projectTitle}`, { indent: 10, continued: true });
                doc.font("Helvetica-Oblique").text(` (${techStack})`);

                const projectItems = project.querySelectorAll("li");
                projectItems.forEach((li: Element) => {
                    doc.fontSize(9)
                        .font("Helvetica")
                        .text(`  - ${li.textContent}`, {
                            indent: 20,
                            paragraphGap: 3,
                        });
                });
            });

            doc.moveDown(0.5);
        });
    }

    private addProjectsSectionToPDF(
        section: Element,
        doc: typeof PDFDocument.prototype,
    ): void {
        const projects = section.querySelectorAll(".project");
        projects.forEach((project: Element) => {
            const projectTitle =
                project.querySelector(".project-title")?.textContent || "";
            const techStack =
                project.querySelector(".tech-stack")?.textContent || "";

            doc.fontSize(11)
                .font("Helvetica-Bold")
                .text(projectTitle, { continued: true });
            doc.font("Helvetica-Oblique").text(` (${techStack})`);
            doc.moveDown(0.3);

            const projectItems = project.querySelectorAll("li");
            projectItems.forEach((li: Element) => {
                doc.fontSize(9).font("Helvetica").text(`• ${li.textContent}`, {
                    indent: 10,
                    paragraphGap: 3,
                });
            });

            doc.moveDown(0.5);
        });
    }

    private addCertificationsSectionToPDF(
        section: Element,
        doc: typeof PDFDocument.prototype,
    ): void {
        const certifications = section.querySelectorAll(".certification");
        certifications.forEach((cert: Element) => {
            const title = cert.querySelector(".cert-title")?.textContent || "";
            const date = cert.querySelector(".cert-date")?.textContent || "";
            doc.fontSize(10)
                .font("Helvetica-Bold")
                .text(title, { continued: true });
            doc.font("Helvetica").text(` - ${date}`);
            doc.moveDown(0.3);
        });
    }

    private addEducationSectionToPDF(
        section: Element,
        doc: typeof PDFDocument.prototype,
    ): void {
        const education = section.querySelectorAll(".education");
        education.forEach((edu: Element) => {
            const title = edu.querySelector(".edu-title")?.textContent || "";
            const date = edu.querySelector(".edu-date")?.textContent || "";
            doc.fontSize(10)
                .font("Helvetica-Bold")
                .text(title, { continued: true });
            doc.font("Helvetica").text(` - ${date}`);
            doc.moveDown(0.3);
        });
    }

    private addGenericSectionToPDF(
        section: Element,
        doc: typeof PDFDocument.prototype,
    ): void {
        const content = section.textContent || "";
        doc.fontSize(10).font("Helvetica").text(content);
    }
}

// CLI script to run the converter
function main() {
    const args = process.argv.slice(2);
    const htmlFilePath = args[0] || "./resume.html";
    const outputDir = args[1] || ".";

    console.log("Resume Converter");
    console.log("================");
    console.log(`Input: ${htmlFilePath}`);
    console.log(`Output directory: ${outputDir}`);
    console.log("");

    try {
        const converter = new ResumeConverter(htmlFilePath, outputDir);

        console.log("Generating markdown...");
        converter.saveMarkdown();

        console.log("Generating PDF...");
        converter.savePDF();

        console.log("");
        console.log("Done! Files will be generated...");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

// Run if this file is executed directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

// For direct usage in other modules
export default ResumeConverter;
