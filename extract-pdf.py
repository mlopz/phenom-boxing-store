#!/usr/bin/env python3
import PyPDF2
import sys

def extract_pdf_text(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            print(f"📄 Extrayendo contenido del PDF: {pdf_path}")
            print(f"📊 Número total de páginas: {len(pdf_reader.pages)}")
            print("=" * 60)
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                page_text = page.extract_text()
                if page_text.strip():
                    print(f"\n--- PÁGINA {page_num} ---")
                    print(page_text)
                    text += f"\n--- PÁGINA {page_num} ---\n{page_text}\n"
                else:
                    print(f"\n--- PÁGINA {page_num} --- (Sin texto extraíble)")
            
            return text
            
    except Exception as e:
        print(f"❌ Error al extraer el PDF: {e}")
        return None

if __name__ == "__main__":
    pdf_path = "src/components/CATALOGO.pdf"
    extract_pdf_text(pdf_path)
