import sys

def check_brackets(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    line_num = 1
    col_num = 0
    
    pairs = {'{': '}', '(': ')', '[': ']'}
    
    for i, char in enumerate(content):
        if char == '\n':
            line_num += 1
            col_num = 0
            continue
        col_num += 1
        
        if char in pairs:
            stack.append((char, line_num, col_num))
        elif char in pairs.values():
            if not stack:
                print(f"Extra closing '{char}' at {line_num}:{col_num}")
            else:
                last_open, l, c = stack.pop()
                if pairs[last_open] != char:
                    print(f"Mismatched closing '{char}' at {line_num}:{col_num} (expected '{pairs[last_open]}' for '{last_open}' opened at {l}:{c})")
    
    if stack:
        print(f"Unclosed brackets:")
        for char, l, c in stack:
            print(f"  '{char}' opened at {l}:{c}")

if __name__ == "__main__":
    check_brackets(sys.argv[1])
