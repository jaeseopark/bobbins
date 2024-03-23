import jinja2
import pdfkit

TEMPLATE_DIR = "/app/templates"
USER_GUIDE_TEMPLATE_PATH = "user_guide.html"
USER_GUIDE_CSS_PATH = "user_guide.css"


def get_template_params(product: dict):
    product = {**product}
    
    stitches = product.get("stitches", dict())
    seam_allowance_description = f"{stitches.get('seamAllowance', '_')} cm away from the edge."
    second_seam_allowance = stitches.get("secondSeamAllowance", 0)
    if second_seam_allowance > 0:
        seam_allowance_description = seam_allowance_description.replace("cm away", f"cm and {second_seam_allowance} cm away")
    top_stitch_description = f"{stitches.get('topStitch', '_')} cm away from the edge."
    baste_stitch_description = f"{stitches.get('basteStitch', '_')} cm away from the edge."

    product.pop("seamAllowance")
    product.pop("topStitch")
    product.pop("basteStitch")

    return dict(
        **product,
        **stitches,
        seam_allowance_description=seam_allowance_description,
        top_stitch_description=top_stitch_description,
        baste_stitch_description=baste_stitch_description,
    )


def generate_user_guide(product: dict) -> str:
    """
    Generates a user guide PDF and returns the path
    """
    template_params = get_template_params(product)
    template_loader = jinja2.FileSystemLoader(searchpath=TEMPLATE_DIR)
    template_env = jinja2.Environment(loader=template_loader)
    template = template_env.get_template(USER_GUIDE_TEMPLATE_PATH)
    html_content = template.render(**template_params)

    options = {
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

    product_id = product["id"]
    pdf_path = f"/data/products/{product_id}-user_guide.pdf"
    pdfkit.from_string(html_content, pdf_path, options=options,
                       css=f"{TEMPLATE_DIR}/{USER_GUIDE_CSS_PATH}")
    return pdf_path
