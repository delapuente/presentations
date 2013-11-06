#!/usr/bin/python
# -*- encoding: utf-8 -*-

'''
In languages like C++ we differentiate CLASSES and OBJECTS. They are different
entities.
'''

'''
Initutitvely, CLASSES are the description of an underlying structure of a set
of items and operations on those items while OBJECTS are values, data, mutable
elements which can change into a problem solution.

In languages like C++, CLASSES belong to the development time while OBJECTS
belong to the execution time.
'''

'''
Objects seem similar but they are ALWAYS distinct. They ALWAYS have different
identities.
'''
a = [1, 2, 3]
b = [1, 2, 3]
assert a == b
assert a is not b
assert id(a) != id(b)
print('id(a) = {}'.format(id(a)))
print('id(b) = {}'.format(id(b)))

'''
CLASSES subclass other classes adding restrictions. We can check this fact by
ussing `issubclass(CLASS1, CLASS2)`.
'''
class Animal(object): pass
class Snake(Animal): pass
class Python(Snake): pass
assert issubclass(Animal, object)
assert issubclass(Snake, Animal)
assert issubclass(Python, Snake)

'''
Subclassing is a transitive relationship. If `Python` subclasses `Snake` and
`Snake` subclasses `Animal`, then `Python` subclasses `Animal`.
'''
assert issubclass(Python, Animal)

'''
Objects CAN NOT subclass other objects. It makes no sense to say an OBJECT
subclasses a CLASS. Subclassing relationship belongs to CLASSES only.
'''
o = Animal()
try:
  issubclass(o, Animal)
except Exception as e:
  print(e)
  assert True
else:
  assert False

'''
The function `issubclass()` is implemented by checking the `__bases__`
attribute of the class. Trivially, any class is considered a subclass of itself.
`issubclass(B, A)` returns `True` if A is a base of B or if A is a base
of one of the bases of B and so on...
'''
assert Animal in Snake.__bases__
assert object not in Snake.__bases__
assert object in Snake.__bases__[0].__bases__

'''
The root of the subclassing hierarchy is always `object`. It means, the most
generic CLASS is always `object`. The `object` CLASS does not subclass anything.
(the empty tuple, not `None`).
'''
assert object.__bases__ == ()
assert object.__bases__ is not None

'''
A CLASS can be used to build an OBJECT if it's used as a function. This creates
a new relationship between the OBJECT and the CLASS: the type. We say an OBJECT
is of type CLASS. It can be checked by `type(OBJECT) is CLASS`.

The type of an OBJECT, i. e, the class used to generate the object is kept in
its attribute `__class__`.
'''
o = object()
a = Animal()
s = Snake()
assert type(o) is object
assert type(a) is Animal
assert type(s) is Snake
assert o.__class__ is object
assert a.__class__ is Animal
assert s.__class__ is Snake

'''
A CLASS can create several OBJECTS but an OBJECT can be created by only one
CLASS. This is the same as saying a CLASS can create several values but a value
can have only one type.
'''
mike = Python()
jane = Python()
assert type(mike) is Python
assert type(jane) is Python

'''
This relationship IS NOT transitive. Indeed, in languages like C++ it does not
make sense at all to talk about the type of a CLASS because classes are not
values. We'll see this is not true in Python...
'''

'''
The last relationship unifies type and subclassing and it only works between
OBJECTS and CLASSES. It's called instantiation and can be checked by
`isinstance(OBJECT, CLASS)`. An OBJECT is an instance of a CLASS if the CLASS
created the OBJECT of if the CLASS is a base of other which created the OBJECT.
'''
mike = Python()
assert isinstance(mike, Python)

'''
Note how instantiation is implemented taking into account the other two
relationships:
 1- First, type --> is OBJECT of type CLASS?
'''
jane = Python()
assert isinstance(jane, Python)
assert type(jane) is Python

'''
 2- Second, subclassing --> is OBJECT of a type subclassing CLASS?
'''
assert isinstance(jane, Animal)
assert issubclass(type(jane), Animal)

'''
What happend with Python is that EVERYTHING is an object. Classes included!
'''
assert isinstance(Animal, object)
assert isinstance(Snake, object)
assert isinstance(Python, object)

'''
How to give the CLASSES, the OBJECT's nature? It makes sense to
ask about the type of a CLASS. Which CLASS build other classes?
'''
assert type(Animal)
assert type(Animal) is type

'''
`type()` function is overloaded. It is not only a built-in function to return
the type of an OBJECT. It is a CLASS too. But in Python, everything is an object
and therefore `type` is an object too.

So, what is the type of `type`?
'''
assert type(type)
assert type(type) is type

'''
If any class is an instance of `object`, this is because type of the class is
`object` (but we have just checked it is not this way) or the class is of a type
subclassing `object`. In other words, `object` is one of the bases of the
class' type.
'''
assert issubclass(type, object)
assert object in type(type).__bases__
assert object in type.__bases__
