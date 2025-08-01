"use strict";
// resume-converter.ts
// TypeScript functions for converting HTML resume to markdown and generating PDF
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// External dependencies (add these to your package.json):
// npm install jspdf html2canvas
// npm install @types/jspdf @types/node (for TypeScript)
// For browser environment, you might need to use UMD imports:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
// For Node.js/bundler environment:
var jspdf_1 = require("jspdf");
var html2canvas_1 = require("html2canvas");
var ResumeConverter = /** @class */ (function () {
    function ResumeConverter(containerId) {
        if (containerId === void 0) { containerId = 'resume-content'; }
        var container = document.getElementById(containerId);
        if (!container) {
            throw new Error("Container with id '".concat(containerId, "' not found"));
        }
        this.resumeContainer = container;
    }
    /**
     * Convert HTML resume to Markdown format
     * @returns {string} Markdown formatted resume
     */
    ResumeConverter.prototype.convertToMarkdown = function () {
        var _this = this;
        var _a, _b;
        var markdown = [];
        // Header section
        var header = this.resumeContainer.querySelector('.header');
        if (header) {
            var name_1 = ((_a = header.querySelector('h1')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
            var title = ((_b = header.querySelector('.title')) === null || _b === void 0 ? void 0 : _b.textContent) || '';
            markdown.push("# ".concat(name_1));
            markdown.push('');
            markdown.push("**".concat(title, "**"));
            markdown.push('');
            // Contact info
            var contactLinks = header.querySelectorAll('.contact-info a');
            var contacts_1 = [];
            contactLinks.forEach(function (link) {
                var href = link.href;
                var text = link.textContent || '';
                if (href.startsWith('mailto:')) {
                    contacts_1.push("**Email:** ".concat(text));
                }
                else {
                    contacts_1.push("[".concat(text, "](").concat(href, ")"));
                }
            });
            if (contacts_1.length > 0) {
                markdown.push(contacts_1.join(' | '));
                markdown.push('');
            }
        }
        // Process each section
        var sections = this.resumeContainer.querySelectorAll('.section');
        sections.forEach(function (section) {
            var _a;
            var sectionTitle = ((_a = section.querySelector('.section-title')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
            markdown.push("## ".concat(sectionTitle.toUpperCase()));
            markdown.push('');
            // Handle different section types
            switch (sectionTitle.toLowerCase()) {
                case 'skills':
                    _this.processSkillsSection(section, markdown);
                    break;
                case 'experience':
                    _this.processExperienceSection(section, markdown);
                    break;
                case 'personal projects':
                    _this.processProjectsSection(section, markdown);
                    break;
                case 'certifications':
                    _this.processCertificationsSection(section, markdown);
                    break;
                case 'education':
                    _this.processEducationSection(section, markdown);
                    break;
                default:
                    _this.processGenericSection(section, markdown);
            }
            markdown.push('');
        });
        return markdown.join('\n');
    };
    /**
     * Process skills section
     */
    ResumeConverter.prototype.processSkillsSection = function (section, markdown) {
        var skillCategories = section.querySelectorAll('.skill-category');
        skillCategories.forEach(function (category) {
            var _a, _b;
            var categoryTitle = ((_a = category.querySelector('h4')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
            var skills = ((_b = category.querySelector('p')) === null || _b === void 0 ? void 0 : _b.textContent) || '';
            markdown.push("**".concat(categoryTitle, ":** ").concat(skills));
        });
    };
    /**
     * Process experience section
     */
    ResumeConverter.prototype.processExperienceSection = function (section, markdown) {
        var experienceItems = section.querySelectorAll('.experience-item');
        experienceItems.forEach(function (item) {
            var _a, _b, _c;
            var jobTitle = ((_a = item.querySelector('.job-title')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
            var company = ((_b = item.querySelector('.company')) === null || _b === void 0 ? void 0 : _b.textContent) || '';
            var duration = ((_c = item.querySelector('.duration')) === null || _c === void 0 ? void 0 : _c.textContent) || '';
            markdown.push("### **".concat(company, " | ").concat(jobTitle, " | ").concat(duration, "**"));
            // Main job description
            var mainUl = item.querySelector('.job-description > ul');
            if (mainUl) {
                var listItems = mainUl.querySelectorAll('li');
                listItems.forEach(function (li) {
                    markdown.push("- ".concat(li.textContent));
                });
            }
            // Projects within the job
            var projects = item.querySelectorAll('.project');
            projects.forEach(function (project) {
                var _a, _b;
                var projectTitle = ((_a = project.querySelector('.project-title')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
                var techStack = ((_b = project.querySelector('.tech-stack')) === null || _b === void 0 ? void 0 : _b.textContent) || '';
                markdown.push("- **".concat(projectTitle, "** *(").concat(techStack, ")*"));
                var projectItems = project.querySelectorAll('li');
                projectItems.forEach(function (li) {
                    markdown.push("  - ".concat(li.textContent));
                });
            });
            markdown.push('');
        });
    };
    /**
     * Process projects section
     */
    ResumeConverter.prototype.processProjectsSection = function (section, markdown) {
        var projects = section.querySelectorAll('.project');
        projects.forEach(function (project) {
            var _a, _b;
            var projectTitle = ((_a = project.querySelector('.project-title')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
            var techStack = ((_b = project.querySelector('.tech-stack')) === null || _b === void 0 ? void 0 : _b.textContent) || '';
            markdown.push("### **".concat(projectTitle, "** *(").concat(techStack, ")*"));
            var projectItems = project.querySelectorAll('li');
            projectItems.forEach(function (li) {
                markdown.push("- ".concat(li.textContent));
            });
            markdown.push('');
        });
    };
    /**
     * Process certifications section
     */
    ResumeConverter.prototype.processCertificationsSection = function (section, markdown) {
        var certifications = section.querySelectorAll('.certification');
        certifications.forEach(function (cert) {
            var _a, _b;
            var title = ((_a = cert.querySelector('.cert-title')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
            var date = ((_b = cert.querySelector('.cert-date')) === null || _b === void 0 ? void 0 : _b.textContent) || '';
            markdown.push("**".concat(title, "** - ").concat(date));
        });
    };
    /**
     * Process education section
     */
    ResumeConverter.prototype.processEducationSection = function (section, markdown) {
        var education = section.querySelectorAll('.education');
        education.forEach(function (edu) {
            var _a, _b;
            var title = ((_a = edu.querySelector('.edu-title')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
            var date = ((_b = edu.querySelector('.edu-date')) === null || _b === void 0 ? void 0 : _b.textContent) || '';
            markdown.push("**".concat(title, "** - ").concat(date));
        });
    };
    /**
     * Process generic section
     */
    ResumeConverter.prototype.processGenericSection = function (section, markdown) {
        var content = section.textContent || '';
        markdown.push(content);
    };
    /**
     * Download the markdown content as a file
     */
    ResumeConverter.prototype.downloadMarkdown = function () {
        var markdownContent = this.convertToMarkdown();
        var blob = new Blob([markdownContent], { type: 'text/markdown' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'Alexander_Emili_Resume.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    /**
     * Generate and download PDF using html2canvas and jsPDF
     */
    ResumeConverter.prototype.downloadPDF = function () {
        return __awaiter(this, void 0, void 0, function () {
            var originalContainer, clonedContainer, canvas, pdf, imgData, pdfWidth, pdfHeight, pageHeight, heightLeft, position, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        originalContainer = this.resumeContainer;
                        clonedContainer = originalContainer.cloneNode(true);
                        // Style the cloned container for PDF
                        clonedContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
                        clonedContainer.style.backgroundColor = 'white';
                        clonedContainer.style.padding = '40px';
                        clonedContainer.style.fontFamily = 'Arial, sans-serif';
                        clonedContainer.style.fontSize = '14px';
                        clonedContainer.style.lineHeight = '1.4';
                        clonedContainer.style.color = '#000';
                        // Temporarily add to DOM for rendering
                        clonedContainer.style.position = 'absolute';
                        clonedContainer.style.left = '-9999px';
                        clonedContainer.style.top = '0';
                        document.body.appendChild(clonedContainer);
                        return [4 /*yield*/, (0, html2canvas_1.default)(clonedContainer, {
                                scale: 2,
                                useCORS: true,
                                backgroundColor: '#ffffff',
                                width: 794,
                                height: clonedContainer.scrollHeight,
                                logging: false
                            })];
                    case 1:
                        canvas = _a.sent();
                        // Remove cloned container
                        document.body.removeChild(clonedContainer);
                        pdf = new jspdf_1.default({
                            orientation: 'portrait',
                            unit: 'mm',
                            format: 'a4'
                        });
                        imgData = canvas.toDataURL('image/png');
                        pdfWidth = pdf.internal.pageSize.getWidth();
                        pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        pageHeight = pdf.internal.pageSize.getHeight();
                        heightLeft = pdfHeight;
                        position = 0;
                        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                        heightLeft -= pageHeight;
                        while (heightLeft >= 0) {
                            position = heightLeft - pdfHeight;
                            pdf.addPage();
                            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                            heightLeft -= pageHeight;
                        }
                        // Save the PDF
                        pdf.save('Alexander_Emili_Resume.pdf');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error generating PDF:', error_1);
                        // Fallback: use browser print
                        this.fallbackPrintPDF();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fallback PDF generation using browser print
     */
    ResumeConverter.prototype.fallbackPrintPDF = function () {
        var printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to download PDF');
            return;
        }
        var resumeHtml = this.resumeContainer.outerHTML;
        var printDocument = "\n      <!DOCTYPE html>\n      <html>\n        <head>\n          <title>Alexander Emili - Resume</title>\n          <style>\n            * { margin: 0; padding: 0; box-sizing: border-box; }\n            body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #000; }\n            .resume-container { max-width: none; margin: 0; padding: 20px; background: white; box-shadow: none; }\n            .header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #ccc; }\n            .header h1 { font-size: 24px; margin-bottom: 5px; }\n            .section-title { font-size: 16px; font-weight: bold; margin: 15px 0 10px 0; border-bottom: 1px solid #ccc; }\n            .skill-category, .project, .certification, .education { background: #f9f9f9; padding: 10px; margin: 5px 0; }\n            .experience-item { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }\n            .job-header { display: flex; justify-content: space-between; margin-bottom: 8px; }\n            .job-title { font-weight: bold; }\n            .company { color: #666; }\n            .duration { color: #666; font-size: 11px; }\n            ul { margin-left: 15px; }\n            li { margin-bottom: 3px; }\n            @media print {\n              body { background: white; }\n              .resume-container { padding: 0; }\n            }\n          </style>\n        </head>\n        <body>\n          ".concat(resumeHtml, "\n        </body>\n      </html>\n    ");
        printWindow.document.write(printDocument);
        printWindow.document.close();
        printWindow.onload = function () {
            printWindow.print();
            printWindow.close();
        };
    };
    return ResumeConverter;
}());
// Initialize converter when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    var converter = new ResumeConverter();
    // Make functions globally available
    window.convertToMarkdown = function () {
        converter.downloadMarkdown();
    };
    window.downloadPDF = function () {
        converter.downloadPDF();
    };
});
// For direct usage in other modules
exports.default = ResumeConverter;
