
from functools import wraps
import time

class CostlyOperations():
            
    def __getattribute__(self, methodname):
        decorators = { '__time__': _timeit, '__log__': _logit }
        try: 
            prefix, decorator = next((prefix, decorator)
                                for prefix, decorator in decorators.items()
                                if methodname.startswith(prefix))
        except StopIteration:
            return super().__getattribute__(methodname)
        
        real_methodname = methodname[len(prefix):]
        method = super().__getattribute__(real_methodname)
        return decorator(method)

    def answer_to_life(self, seconds=1):
        time.sleep(seconds)
        return 42
   
def _timeit(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        before = time.time()
        result = f(*args, **kwargs)
        after = time.time()
        print('Execution time: {}'.format(after - before));
        return result
        
    return wrapper

def _logit(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        result = f(*args, **kwargs)
        name = f.__name__
        positional = list(map(lambda i: repr(i), args))
        keywords = list(map(lambda pair: '{}={}'.format(pair[0], repr(pair[1])), 
                   kwargs.items()))
        arguments = ', '.join(positional + keywords)   
        print('{}({}) = {}'.format(name, arguments, repr(result))) 
        return result
        
    return wrapper
