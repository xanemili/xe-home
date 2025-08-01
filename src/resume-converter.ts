// resume-converter.ts
// TypeScript functions for converting HTML resume to markdown and generating PDF

// External dependencies (add these to your package.json):
// npm install jspdf html2canvas
// npm install @types/jspdf @types/node (for TypeScript)

// For browser environment, you might need to use UMD imports:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

// For Node.js/bundler environment:
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  private resumeContainer: HTMLElement;

  constructor(containerId: string = 'resume-content') {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found`);
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
    const header = this.resumeContainer.querySelector('.header');
    if (header) {
      const name = header.querySelector('h1')?.textContent || '';
      const title = header.querySelector('.title')?.textContent || '';
      
      markdown.push(`# ${name}`);
      markdown.push('');
      markdown.push(`**${title}**`);
      markdown.push('');
      
      // Contact info
      const contactLinks = header.querySelectorAll('.contact-info a');
      const contacts: string[] = [];
      contactLinks.forEach((link: Element) => {
        const href = (link as HTMLAnchorElement).href;
        const text = link.textContent || '';
        if (href.startsWith('mailto:')) {
          contacts.push(`**Email:** ${text}`);
        } else {
          contacts.push(`[${text}](${href})`);
        }
      });
      
      if (contacts.length > 0) {
        markdown.push(contacts.join(' | '));
        markdown.push('');
      }
    }

    // Process each section
    const sections = this.resumeContainer.querySelectorAll('.section');
    sections.forEach((section: Element) => {
      const sectionTitle = section.querySelector('.section-title')?.textContent || '';
      markdown.push(`## ${sectionTitle.toUpperCase()}`);
      markdown.push('');

      // Handle different section types
      switch (sectionTitle.toLowerCase()) {
        case 'skills':
          this.processSkillsSection(section, markdown);
          break;
        case 'experience':
          this.processExperienceSection(section, markdown);
          break;
        case 'personal projects':
          this.processProjectsSection(section, markdown);
          break;
        case 'certifications':
          this.processCertificationsSection(section, markdown);
          break;
        case 'education':
          this.processEducationSection(section, markdown);
          break;
        default:
          this.processGenericSection(section, markdown);
      }
      
      markdown.push('');
    });

    return markdown.join('\n');
  }

  /**
   * Process skills section
   */
  private processSkillsSection(section: Element, markdown: string[]): void {
    const skillCategories = section.querySelectorAll('.skill-category');
    skillCategories.forEach((category: Element) => {
      const categoryTitle = category.querySelector('h4')?.textContent || '';
      const skills = category.querySelector('p')?.textContent || '';
      markdown.push(`**${categoryTitle}:** ${skills}`);
    });
  }

  /**
   * Process experience section
   */
  private processExperienceSection(section: Element, markdown: string[]): void {
    const experienceItems = section.querySelectorAll('.experience-item');
    experienceItems.forEach((item: Element) => {
      const jobTitle = item.querySelector('.job-title')?.textContent || '';
      const company = item.querySelector('.company')?.textContent || '';
      const duration = item.querySelector('.duration')?.textContent || '';
      
      markdown.push(`### **${company} | ${jobTitle} | ${duration}**`);
      
      // Main job description
      const mainUl = item.querySelector('.job-description > ul');
      if (mainUl) {
        const listItems = mainUl.querySelectorAll('li');
        listItems.forEach((li: Element) => {
          markdown.push(`- ${li.textContent}`);
        });
      }
      
      // Projects within the job
      const projects = item.querySelectorAll('.project');
      projects.forEach((project: Element) => {
        const projectTitle = project.querySelector('.project-title')?.textContent || '';
        const techStack = project.querySelector('.tech-stack')?.textContent || '';
        
        markdown.push(`- **${projectTitle}** *(${techStack})*`);
        
        const projectItems = project.querySelectorAll('li');
        projectItems.forEach((li: Element) => {
          markdown.push(`  - ${li.textContent}`);
        });
      });
      
      markdown.push('');
    });
  }

  /**
   * Process projects section
   */
  private processProjectsSection(section: Element, markdown: string[]): void {
    const projects = section.querySelectorAll('.project');
    projects.forEach((project: Element) => {
      const projectTitle = project.querySelector('.project-title')?.textContent || '';
      const techStack = project.querySelector('.tech-stack')?.textContent || '';
      
      markdown.push(`### **${projectTitle}** *(${techStack})*`);
      
      const projectItems = project.querySelectorAll('li');
      projectItems.forEach((li: Element) => {
        markdown.push(`- ${li.textContent}`);
      });
      
      markdown.push('');
    });
  }

  /**
   * Process certifications section
   */
  private processCertificationsSection(section: Element, markdown: string[]): void {
    const certifications = section.querySelectorAll('.certification');
    certifications.forEach((cert: Element) => {
      const title = cert.querySelector('.cert-title')?.textContent || '';
      const date = cert.querySelector('.cert-date')?.textContent || '';
      markdown.push(`**${title}** - ${date}`);
    });
  }

  /**
   * Process education section
   */
  private processEducationSection(section: Element, markdown: string[]): void {
    const education = section.querySelectorAll('.education');
    education.forEach((edu: Element) => {
      const title = edu.querySelector('.edu-title')?.textContent || '';
      const date = edu.querySelector('.edu-date')?.textContent || '';
      markdown.push(`**${title}** - ${date}`);
    });
  }

  /**
   * Process generic section
   */
  private processGenericSection(section: Element, markdown: string[]): void {
    const content = section.textContent || '';
    markdown.push(content);
  }

  /**
   * Download the markdown content as a file
   */
  public downloadMarkdown(): void {
    const markdownContent = this.convertToMarkdown();
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Alexander_Emili_Resume.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Generate and download PDF using html2canvas and jsPDF
   */
  public async downloadPDF(): Promise<void> {
    try {
      // Create a clone of the resume container for PDF generation
      const originalContainer = this.resumeContainer;
      const clonedContainer = originalContainer.cloneNode(true) as HTMLElement;
      
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
      
      // Convert to canvas
      const canvas = await html2canvas(clonedContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: clonedContainer.scrollHeight,
        logging: false
      });
      
      // Remove cloned container
      document.body.removeChild(clonedContainer);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Handle multi-page PDF if content is too long
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;
      
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
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Fallback: use browser print
      this.fallbackPrintPDF();
    }
  }

  /**
   * Fallback PDF generation using browser print
   */
  private fallbackPrintPDF(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download PDF');
      return;
    }
    
    const resumeHtml = this.resumeContainer.outerHTML;
    const printDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Alexander Emili - Resume</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #000; }
            .resume-container { max-width: none; margin: 0; padding: 20px; background: white; box-shadow: none; }
            .header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #ccc; }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .section-title { font-size: 16px; font-weight: bold; margin: 15px 0 10px 0; border-bottom: 1px solid #ccc; }
            .skill-category, .project, .certification, .education { background: #f9f9f9; padding: 10px; margin: 5px 0; }
            .experience-item { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
            .job-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .job-title { font-weight: bold; }
            .company { color: #666; }
            .duration { color: #666; font-size: 11px; }
            ul { margin-left: 15px; }
            li { margin-bottom: 3px; }
            @media print {
              body { background: white; }
              .resume-container { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${resumeHtml}
        </body>
      </html>
    `;
    
    printWindow.document.write(printDocument);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
}

// Global functions for button clicks
declare global {
  interface Window {
    convertToMarkdown: () => void;
    downloadPDF: () => void;
  }
}

// Initialize converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const converter = new ResumeConverter();
  
  // Make functions globally available
  window.convertToMarkdown = () => {
    converter.downloadMarkdown();
  };
  
  window.downloadPDF = () => {
    converter.downloadPDF();
  };
});

// For direct usage in other modules
export default ResumeConverter;
