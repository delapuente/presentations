
def restrict(base, to=None):
    whitelist = to 
    
    class Restricted(base):
        def __getattribute__(self, name):
            if name[0] != '_' and name not in whitelist:
                raise RuntimeError(
                      'Access to \'{}\' is not allowed'.format(name))
            
            return base.__getattribute__(self, name)
        
        def __setattr__(self, name, value):
            if name[0] != '_' and name not in whitelist:
                raise RuntimeError(
                      'Access to \'{}\' is not allowed'.format(name))
            
            return base.__setattr__(self, name, value)

    return Restricted
