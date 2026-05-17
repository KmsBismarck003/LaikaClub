import os

for root, _, files in os.walk(os.path.abspath('src/components')):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Fix `from \'`
            new_content = content.replace("from \\'", "from '")
            # Fix `\'` at the end
            new_content = new_content.replace("\\'", "'")
            
            # Since `from '..'` works, we will also replace `from '..'` to `from '../index'` to be perfectly safe, or just `from '../'`
            new_content = new_content.replace("from '..'", "from '../'")
            new_content = new_content.replace("from '..//'", "from '../'") # in case it was already '../'
            new_content = new_content.replace("from '../..'", "from '../../'")
            new_content = new_content.replace("from '../..//'", "from '../../'")
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print('Fixed quotes in:', file_path)
