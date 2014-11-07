
class PrivateMemberAccessAttemp(Exception):
    '''Someone's has attemped to access a private member'''

class Protected(type):

    def __new__(klass, name, bases, namespace, **kwargs):
        namespace['__getattribute__'] = Protected.getattribute
        namespace['__setattr__'] = Protected.setattr
        return type(name, bases, namespace, **kwargs)

    @staticmethod
    def setattr(self, membername, value):
        try:
            self.__getattribute__(membername, from_set=True)
        except PrivateMemberAccessAttemp as e:
            raise e
        except:
            pass
        
        return object.__setattr__(self, membername, value)
    
    @staticmethod
    def getattribute(self, membername, from_set=False):
        import inspect
        klass = type(self)
        klasses = list(klass.__mro__[:-1]) + [Protected]
        sources = ((k, inspect.getsourcelines(k)) for k in klasses)
        sources = ((inspect.getsourcefile(k), offset, offset + len(lines))
                  for k, (lines, offset) in sources)
        
        if membername[0] == '_' and membername[0:2] != '__':
            frames = inspect.getouterframes(inspect.currentframe())
            previousframe = frames[1 if not from_set else 2]
            
            currentfilename = previousframe[1]
            currentlineno = previousframe[2]

            contains_the_call = (lambda source: currentfilename == source[0]
                                 and source[1] <= currentlineno < source[2])

            in_some_class = any(map(contains_the_call, sources))
            if not in_some_class:
                raise PrivateMemberAccessAttemp(
                      'Trying to access a private member')

        return object.__getattribute__(self, membername)

