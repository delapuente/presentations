
from difflib import SequenceMatcher

def fuzzyfy(klass):
    similarity = lambda n, m: SequenceMatcher(None, n, m).ratio()

    class Fuzzy(klass):
        def __getattr__(self, name):
            issimilar = lambda n: similarity(n, name) >= 0.8
            matches = list(filter(issimilar, dir(self)))
            if not matches or len(matches) > 1:
                msg = 'Too much ambiguity'
                msg += ' among {}'.format(matches) if matches else ''
                raise AttributeError(msg)
            
            print('Assuming you mean \'{}\''.format(matches[0]))
            return getattr(self, matches[0])
    
    return Fuzzy
