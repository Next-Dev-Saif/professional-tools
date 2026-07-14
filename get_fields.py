import os
import re

dir_path = r'd:\web projects\professional-tools\src\components\page-sections'
tools_info = {}

for root, _, files in os.walk(dir_path):
    for f in files:
        if f.endswith('.tsx'):
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            names = re.findall(r'<(?:input|textarea|select)\b[^>]*name=[\"\'\{]?([a-zA-Z0-9_\.]+)', content)
            if names:
                tool_name = os.path.basename(os.path.dirname(file_path))
                if tool_name not in tools_info:
                    tools_info[tool_name] = set()
                tools_info[tool_name].update(names)

for t, names in tools_info.items():
    print(f'{t}: {", ".join(sorted(list(names)))}')
