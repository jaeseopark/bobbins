import jinja2
import pdfkit

TEMPLATE_DIR = "/app/templates"
USER_GUIDE_TEMPLATE_PATH = "user_guide.html"
USER_GUIDE_CSS_PATH = "user_guide.css"
HTML_OPTIONS = {
    # 'page-size': 'Custom',
    'page-width': '172.72',  # =6.8 inches
    'page-height': '223.52',  # =8.8 inches
    'margin-top': '0.35in',
    'margin-right': '0.35in',
    'margin-bottom': '0.35in',
    'margin-left': '0.35in',
    'encoding': "UTF-8",
    'no-outline': None,
    'enable-local-file-access': True,
    'dpi': 300
}


def get_template_params(product: dict):
    product = {**product}

    stitches = product.get("stitches", dict())
    seam_allowance_description = f"{stitches.get('seamAllowance', '_')} cm away from the edge."
    second_seam_allowance = stitches.get("secondSeamAllowance", 0)
    if second_seam_allowance > 0:
        seam_allowance_description = seam_allowance_description.replace("cm away", f"cm and {second_seam_allowance} cm away")
    top_stitch_description = f"{stitches.get('topStitch', '_')} cm away from the edge."
    baste_stitch_description = f"{stitches.get('basteStitch', '_')} cm away from the edge."

    for key in ("seamAllowance", "topStitch", "basteStitch"):
        if key in product:
            product.pop(key)

    shouldShowTips = len(product.get("tips", "")) > 0

    return dict(
        **product,
        **stitches,
        seam_allowance_description=seam_allowance_description,
        top_stitch_description=top_stitch_description,
        baste_stitch_description=baste_stitch_description,
        shouldShowTips=shouldShowTips,
    )


def generate_user_guide(product: dict) -> str:
    """
    Generates a user guide PDF and returns the path
    """
    assert isinstance(product, dict), "'product' must be a dictionary."

    template_params = get_template_params(product)
    template_loader = jinja2.FileSystemLoader(searchpath=TEMPLATE_DIR)
    template_env = jinja2.Environment(loader=template_loader)
    template = template_env.get_template(USER_GUIDE_TEMPLATE_PATH)
    html_content = template.render(**template_params)

    product_id = product["id"]
    pdf_path = f"/data/products/{product_id}-user_guide.pdf"
    generate_pdf_from_html(
        html_content,
        pdf_path,
        options=HTML_OPTIONS,
        css=f"{TEMPLATE_DIR}/{USER_GUIDE_CSS_PATH}"
    )
    return pdf_path


def generate_pdf_from_html(html: str, pdf_path: str, **kwargs):
    """
    Generates a PDF for the given HTML string
    """
    pdfkit.from_string(
        html,
        pdf_path,
        **kwargs
    )
