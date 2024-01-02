import jinja2
import pdfkit

TEMPLATE_DIR = "/app/templates"
USER_GUIDE_TEMPLATE_PATH = "user_guide.html"


def generate_user_guide(product: dict) -> str:
    """
    Generates a user guide PDF and returns the path
    """
    template_loader = jinja2.FileSystemLoader(searchpath=TEMPLATE_DIR)
    template_env = jinja2.Environment(loader=template_loader)
    template = template_env.get_template(USER_GUIDE_TEMPLATE_PATH)
    html_content = template.render(**product)

    options = {
        # 'page-size': 'Custom',
        'page-width': '172.72', # =6.8 inches
        'page-height': '223.52', # =8.8 inches
        'margin-top': '0.35in',
        'margin-right': '0.35in',
        'margin-bottom': '0.35in',
        'margin-left': '0.35in',
        'encoding': "UTF-8",
        'no-outline': None,
        'enable-local-file-access': True
    }

    product_id = product["id"]
    pdf_path = f"/data/products/{product_id}-user_guide.pdf"
    pdfkit.from_string(html_content, pdf_path, options=options)
    return pdf_path
