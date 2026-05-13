from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

hashes = [
    "$2b$12$H0oFDa/HWugqohdvBJt4ieHqBo9wOR.YI5wvt51VBlTopBKkmLR/y",
    "$2b$12$7LUtsg1WdwLU6STg8FjEJ.baXt45bN.ppVQOFTqeo9WSJqzcVl68m",
    "$2b$12$CqZxRo54JVaaC9Xen8Ra7.nUMhl5iop1l05KnUCVhz6QB5vbJHM.O"
]

password = "gearsof2"

for h in hashes:
    try:
        match = pwd_context.verify(password, h)
        print(f"Hash {h}: {'MATCH' if match else 'NO MATCH'}")
    except Exception as e:
        print(f"Error checking hash {h}: {e}")
