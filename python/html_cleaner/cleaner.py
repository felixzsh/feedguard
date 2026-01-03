"""
HTML Structure Preserver for Playwright
Preserves DOM attributes needed for selectors while reducing size
"""
from bs4 import BeautifulSoup, Comment, Doctype
import sys
import json
import re
from typing import TypedDict, List, Dict, Any


class StructuredResult(TypedDict):
    original_size: int
    preserved_size: int
    reduction_percent: float
    preserved_elements: List[Dict[str, Any]]  # Elementos con atributos clave
    sample_html: str  # HTML de muestra con estructura preservada


def is_useful_attr(attr_name: str, attr_value: str) -> bool:
    """
    Determina si un atributo es útil para selectores de Playwright
    """
    # Atributos clave para selectores
    key_attrs = [
        'id', 'class', 'role', 'name', 'href', 'src', 'alt', 'title',
        'aria-label', 'aria-describedby', 'aria-labelledby',
        'data-testid', 'data-ft', 'data-pagelet', 'data-ad-preview',
        'data-visualcompletion', 'type', 'value', 'placeholder'
    ]
    
    # Patrones regex para atributos de datos dinámicos
    data_patterns = [
        r'data-[\w-]+',  # data-cualquier-cosa
        r'aria-[\w-]+',  # aria-cualquier-cosa
        r'data-\w+',     # data-algo
    ]
    
    # Verifica si es un atributo clave
    if attr_name in key_attrs:
        return True
    
    # Verifica patrones de datos
    for pattern in data_patterns:
        if re.match(pattern, attr_name):
            return True
    
    # Facebook-specific attributes
    if any(fb in attr_name for fb in ['fb-', 'fb:', '_fb']):
        return True
    
    return False


def get_element_path(element) -> Dict[str, str]:
    """
    Genera múltiples formas de seleccionar un elemento
    """
    paths = {}
    
    # 1. ID (el mejor selector)
    if element.get('id'):
        paths['id_selector'] = f'#{element["id"]}'
    
    # 2. Clases específicas
    classes = element.get('class', [])
    if classes:
        # Tomar solo clases que no sean random (no números/largas)
        useful_classes = [c for c in classes if len(c) < 20 and not re.match(r'^[a-f0-9]+$', c)]
        if useful_classes:
            paths['class_selector'] = f'.{".".join(useful_classes[:3])}'
    
    # 3. Atributos específicos
    for attr, value in element.attrs.items():
        if is_useful_attr(attr, value):
            if attr in ['role', 'data-testid', 'data-ad-preview']:
                paths[f'{attr}_selector'] = f'[{attr}="{value}"]'
    
    # 4. XPath aproximado basado en posición
    tag_name = element.name
    parent = element.parent
    if parent and parent.name:
        sibling_index = 1
        for sibling in parent.find_all(tag_name, recursive=False):
            if sibling == element:
                paths['xpath'] = f'//{tag_name}[{sibling_index}]'
                break
            sibling_index += 1
    
    return paths


def preserve_dom_structure(html: str) -> StructuredResult:
    """
    Preserva elementos con atributos útiles para Playwright
    """
    soup = BeautifulSoup(html, 'html.parser')
    
    # 1. Remover elementos realmente inútiles
    for script in soup.find_all(['script', 'style', 'noscript']):
        script.decompose()
    
    for comment in soup.find_all(text=lambda text: isinstance(text, Comment)):
        comment.extract()
    
    # 2. Encontrar elementos interactivos/estructurales importantes
    preserved_elements = []
    
    # Elementos que TÍPICAMENTE contienen contenido en Facebook
    content_patterns = [
        {'tags': ['article', 'div', 'section'], 'attrs': ['role'], 'values': ['article', 'main']},
        {'tags': ['div'], 'attrs': ['data-pagelet'], 'values': ['FeedUnit_']},
        {'tags': ['div'], 'attrs': ['data-ad-preview'], 'values': ['message']},
        {'tags': ['a'], 'attrs': ['href'], 'patterns': [r'/posts/', r'/story\.php']},
        {'tags': ['img'], 'attrs': ['src', 'alt'], 'exclude': ['profile', 'emoji']},
        {'tags': ['button', 'input', 'textarea'], 'attrs': ['type', 'value', 'placeholder']},
    ]
    
    for element in soup.find_all(True):  # Todos los elementos
        attrs = element.attrs
        
        # Filtrar solo atributos útiles
        useful_attrs = {}
        for attr_name, attr_value in attrs.items():
            if is_useful_attr(attr_name, attr_value):
                # Limitar longitud de valores largos
                if isinstance(attr_value, list):
                    useful_attrs[attr_name] = attr_value[:3]  # Primeras 3 clases
                elif len(str(attr_value)) > 100:
                    useful_attrs[attr_name] = str(attr_value)[:50] + '...'
                else:
                    useful_attrs[attr_name] = attr_value
        
        # Verificar si el elemento coincide con patrones de contenido
        matches_pattern = False
        for pattern in content_patterns:
            if element.name in pattern['tags']:
                for attr in pattern.get('attrs', []):
                    if attr in attrs:
                        attr_value = attrs[attr]
                        if 'values' in pattern:
                            for val in pattern['values']:
                                if val in str(attr_value):
                                    matches_pattern = True
                                    break
                        if 'patterns' in pattern:
                            for pat in pattern['patterns']:
                                if re.search(pat, str(attr_value)):
                                    matches_pattern = True
                                    break
        
        # O si tiene atributos útiles
        has_useful_attrs = len(useful_attrs) > 0
        
        # O si contiene texto significativo
        text_content = element.get_text(strip=True)
        has_significant_text = len(text_content) > 10 and len(text_content) < 500
        
        if matches_pattern or has_useful_attrs or has_significant_text:
            # Generar posibles selectores
            selectors = get_element_path(element)
            
            # Solo incluir si podemos generar algún selector útil
            if selectors:
                preserved_elements.append({
                    'tag': element.name,
                    'attrs': useful_attrs,
                    'text_preview': text_content[:100] if text_content else '',
                    'selectors': selectors,
                    'child_count': len(element.find_all(True, recursive=False)),
                    'depth': len(list(element.parents))
                })
    
    # 3. Crear HTML de muestra con elementos preservados (opcional)
    sample_soup = BeautifulSoup('<div class="preserved-structure"></div>', 'html.parser')
    container = sample_soup.find('div')
    
    for elem_info in preserved_elements[:50]:  # Solo primeros 50 para muestra
        sample_elem = sample_soup.new_tag('div', **{'data-original-tag': elem_info['tag']})
        
        # Agregar atributos como data-attrs
        for attr, value in elem_info['attrs'].items():
            if isinstance(value, list):
                sample_elem['data-' + attr] = ' '.join(value[:3])
            else:
                sample_elem['data-' + attr] = str(value)[:30]
        
        # Agregar selectores como data-selectors
        if elem_info['selectors']:
            sample_elem['data-selectors'] = json.dumps(elem_info['selectors'])[:100]
        
        sample_elem.string = f"{elem_info['tag']}: {elem_info['text_preview'][:50]}..."
        container.append(sample_elem)
    
    original_size = len(html)
    preserved_count = len(preserved_elements)
    preserved_size = len(str(preserved_elements))
    reduction = ((original_size - preserved_size) / original_size) * 100
    
    return {
        "original_size": original_size,
        "preserved_size": preserved_size,
        "reduction_percent": round(reduction, 2),
        "preserved_elements": preserved_elements[:200],  # Limitar a 200 elementos
        "sample_html": str(container),
        "stats": {
            "total_elements_found": preserved_count,
            "elements_with_id": len([e for e in preserved_elements if 'id' in e['attrs']]),
            "elements_with_data_attrs": len([e for e in preserved_elements if any(a.startswith('data-') for a in e['attrs'])]),
            "elements_with_role": len([e for e in preserved_elements if 'role' in e['attrs']]),
            "top_tags": dict(sorted([(tag, len([e for e in preserved_elements if e['tag'] == tag])) 
                                    for tag in set(e['tag'] for e in preserved_elements)], 
                                   key=lambda x: x[1], reverse=True)[:10])
        }
    }


def main():
    """
    CLI entry point para integración con TypeScript
    """
    try:
        # Leer HTML desde stdin
        html = sys.stdin.read()
        
        if not html or len(html.strip()) == 0:
            print(json.dumps({
                "error": "No HTML input received"
            }), file=sys.stderr)
            sys.exit(1)
        
        # Preservar estructura para Playwright
        result = preserve_dom_structure(html)
        
        # Salida JSON
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "traceback": str(sys.exc_info())
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
