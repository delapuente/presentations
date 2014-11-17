
# Method dispatching techniques in Python

## Fuzzy APIs
Hola, gracias por venir a esta PyConES 2014 y a mi charla sobre Fuzzy APIs
cuando en realidad versa sobre técnicas de ¿_reparto de mensajes_? Method
Dispatching, vamos.

Me gustaría contaros una historia que se repite con bastante frecuencia en
mi día a día:

    mkdir gitrepo
    cd gitrepo
    git init
    git status
    touch README.md
    echo '# Testing git' >> README.md
    git status
    git add README.md
    git comit -m'Initial commit'

¡Vaya! A ver Git, ¿qué he querido decir? Ah, claro, 'commit' evidentemente. No
creo que haya otros comandos mucho más parecidos. A ver...

    git help --all

Pues no, no hay nada muy parecido a `commit`. Pues podría haber ejecutado el
comando correcto, ¿no?

Evidentemente, y por la cuenta que le trae al usuario y su propensión a liarla
parda con git, casi es mejor que no haga nada pero no me digáis que no os ha
pasado alguna vez y hubierais deseado que lo hiciera.

Dejad que os enseñe una implementación en Python de cómo podría ser el
programa `git`.

    cd ..
    python
    from git import Git
    git = Git('.')

¡Uy! Bueno, aunque la presentación es un repositorio también prefiero hacer
las pruebas en el repositorio de pruebas.
    
    git._path = '/home/salva/workspace/presentations/method-dispatching/demo/gitrepo/'
    git._setup_commands()

Ya sé que es una guarrada. Pero bueno, ya está hecho. Ale, ahora sí.
    
    git.interactive = True
    git.status()

El programa git lee la salida del la orden `git help --all` y extrae la lista
de comandos creando dinámicamente un método por cada uno. El modo interactivo
me permite usarlo como si fuera una línea de comandos.

El problema ahora es que no hay sugerencias.

    git.comit('-m', 'Initial commit')

Y no hay sugerencia porque `comit` no es un método:

    git.help('--all')

Pero bueno, da igual, importamos la utilidad fuzzyfy del módulo fuzzyfy:

    from fuzzyfy import fuzzyfy
    FuzzyGit = fuzzyfy(Git)
    git = FuzzyGit('./gitrepo')
    git.interactive = True
    git.comit('-m', 'Initial commit')

Y listo. Si hiciéramos esto mismo con otros métodos obtendríamos resultados
similares:

    git.statuss()
    git.stats()

Puede parecer arriesgado pero al menos la salida nos informa de que se nos
está corrigiendo y llegado el punto de mucha ambigüedad, no elige el comando
que le sale de ahí.

Los conocedores de la librería estándar de Python (si es que alguien puede
llamarse experto en ello) o los que hayan traído su propio portátil se habrán
dado cuenta de que `fuzzyfy` no es una utilidad estándar (menos mal por otro
lado). No, precisamente esta es la utilidad de la que tomaba el título la
charla.

¿Cómo se hace?

  >>> Contar hasta Fuzzy APIs (incluido)

## Restricted Proxy Subclasses

Me gustaría contaros otro caso _git_. Venga, ¿quién no se ha pegado una mañana
entera ayudando al compi de curro que se ha cargado la copia local (¡cuando no
se ha cargado la copia remota!)? Y no me digáis que no se os pasa por la cabeza
que debería haber un modo n00b para esta gente en la que comandos como `rebase`
o `push -f` no deberían funcionar.

En definitiva, algo como:

    from restricted import restrict
    LocalGit = restrict(Git, to=['status','commit','add','log','diff'])
    git = LocalGit('./gitrepo')
    git.push('origin', 'master')

Ahora todos dormiremos mucho más tranquilos.

¿Cómo se hace esto?

  >>> Contar el siguiente

## Private members

Las posibilidades de trucar los métodos mágicos son infinitas. He dejado el
ejemplo más impresionante para el final. ¿Os acordáis de cuándo me equivoqué
al comienzo de la presentación y haciendo _monkey patch_ solucioné el problema
del path?

Todos estamos de acuerdo en que por modificar las tripas de la instancia
deberían cortarme las manos pero bueno, es mi instancia y me la frunjo cuando
quiero.

Vamos a hacer una ligera modificación al fuente de la clase git para evitar
este tipo de situaciones.

    vim git.py

Y ahora repetiré el primer ejemplo.

    from git import Git
    git = Git('.')
    git._path = './gitrepo'

Ala, ¡a tomar viento! ¿Qué ha pasado?

    >>> Explicar Private Members
    >>> Y terminar.

