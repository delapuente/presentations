
# There is no such thing as plain text
Esta es una sesión de código en vivo para visualizar algo mejor todo lo que
hemos explicado hasta el momento y con el fin de que os convenzáis de una cosa:
**no existe tal cosa como el texto plano**. O al menos, no es que no exista, es
que "texto plano" no significa nada sin una codificación.

Vamos a empezar volcando la palabra `España` a un fichero. Como todo mi sistema
está preparado para trabajar en UTF-8, es previsible que aparecerá el código
`C3B1` del que hablábamos antes:

    echo -n España > test

Ahora vamos a ver los contenidos y la longitud con `cat`, `hexdump` y `du`:

    cat test
    hexdump -C test
    du -b test

Bueno, todo como pretendíamos. Perfecto. Podemos intentar escribir `España`
con 6 caracteres utilizando, por ejemplo, Latin-1. Vamos a ver cómo se escribe
la ñ dado que el resto de las letras se corresponden con ASCII

    echo -n -e 'Espa\xf1a' > test_latin_1

Como veis, el _code point_ para la ñ es `00F1` y como Latin-1 usa una
codificación de 1 byte pues es suficiente con eso.

    hexdump -C test_latin_1

El problema es que ahora con `cat` obtendremos un resultado extraño:

    cat test_latin_1

Porque mi consola está pensada para mostrar texto en UTF-8 y no entiende el 
código `F1` ese. Pero eso tiene fácil solución, cambiamos la codificación y
listo:

    cat test_latin_1
    du -b test_latin_1

Volvamos a UTF-8 que me siento más seguro. Como veis, mismo texto y
codificationes distintas.

    file test
    file test_latin_1

Y esto sucede porque `file` es mu listo y averigua el encoding pero vamos a
hacerlo fallar. Veamos qué pasa al usar UCS-2:

    echo -e -n '\x45\x00\x73\x00\x70\x00\x61\x00\xf1\x00\x61\x00' > test_ucs_2

Os preguntaréis por qué lo escribo así y es porque mi sistema (como el vuestro)
es Little Endian así que tengo que escribir mis pares de bytes al revés.

    python -c "import sys;print(sys.byteorder)"
    file test_ucs_2

Vamos, que ni puñetera idea. Pero oye, vamos a abrir el fichero con node.js

    node

Y a intentar decodificarlo **sabiendo** que es UCS-2:

    fs = require('fs')
    data = fs.readFileSync('./test_ucs_2')
    data.toString('ucs-2')

Ya tiene todo más sentido. Pero fijaos en la diferencia entre `buffer` y
`string`:

    data.constructor
    data.toString('ucs-2').constructor

Lo que hemos leído del fichero son datos. Una versión codificada del texto y
para decodificarla tenemos que conocer una clave que no es sino el esquema
de codificación, es este caso UCS-2. Esto nos da un String.

Pero mirad que más allá de lo que pueda intuir `file`, la codificación no
está en el fichero luego sin codificación, el concepto de texto plano está 
incompleto. En el fichero sólo hay un montón de bytes.

Vamos a abrir este fichero en Python 2.

    python2
    with open('./test_ucs_2') as f:
      data = f.read()

    type(data)
    data

Vaya, en Python 2 data sí que es un String. ¿Qué ha pasado? Lo que ha pasado
es que en Python 2, un objeto del tipo str NO es una cadena de texto sino una
cadena de bytes. Y la codificación por defecto es ASCII. Así de sencillo.

Vamos a intentar transformar esta cadena en una secuencia de bytes UTF-8.
Como sabemos que está en UCS-2, primero vamos a decodificar esos bytes con
este esquema. Bueno, lo haremos con UTF-16 (que recordemos que se solapa) porque
Python2 no incluye UCS-2.

    text = data.decode('utf-16-le')

`le` por little Endian

    type(text)
    text

¡Anda! ¿Y este tipo unicode? Eso es como Python 2 llama a los textos. Es decir
que hablar del tipo `unicode` en Python2 es como hablar del tipo `String` en
node para liarla todavía más.

Vamos a ver algunas diferencias:

    len(data)
    len(text)

Como veis, `unicode` y `str` no son lo mismo. El primero representa texto
en unicode y el segundo sucesiones de bytes. No hay color.

Ahora vamos a convertir este texto en UTF-8. Para ello tendremos que
codificarlo:

    utf8_data = text.encode('utf-8')
    len(utf8_data)

Bien, esto se parece mucho a lo que teníamos al principio. Y ahora vamos a
guardarlo.

    with open('./test_utf8') as f:
      f.write(utf8_data)

    cat test_utf8

¿Comprendido? Una cosa son los datos y otra es el texto. Ir de los datos al
texto es decodificar mientras que pasar de texto a datos es codificar. Tanto
para lo uno como para lo otro necesitamos un esquema de codificación. Intentar
decodificar algo con un esuqema que no es producirá, en el mejor de los casos,
basura.

    with open('./test_ucs_2') as f:
      data = f.read()

    text = data.decode('ascii')
    text = data.decode('latin-1')
    len(text)
    print(text)

No os dejéis engañar. Lo que ocurre es que cuando hacemos print de una cadena
unicode, ella intepreta cada uno de los 12 code points como en UTF-8 y dado que
el 0 no se puede pintar, parece que puede escribirlo correctamente. En realidad
lo que ha escrito es equivalente a:

    import sys
    sys.stdout
    sys.stdout = open('./false_utf8')
    print(text)

    cat false_utf8
    file false_utf8
    du -b false_utf8
    hexdump -C false_utf8

Nada que ver con el verdadero archivo en utf-8.

La gente suele hacerse un lio con Python porque la codificación por defecto
del systema y la de la entrada y la salida estándar no coinciden:

    import sys
    sys.stdout.encoding
    sys.stdin.encoding
    sys.getdefaultencoding()

Gracias a Krom, en Python 3 arreglaron este pifostio renombrando los conceptos:
  * El tipo unicode se convertiría en str
  * El tipo str se convertiría en bytes

De hecho, en Python 3, los archivos por defecto se abren en modo texto y se
intentan decodificar con utf-8. Así que:

    with open('./test_ucs_2') as f:
      data = f.read()
  
No funcionará, tendremo que hacer:

    with open('./test_ucs_2', 'rb') as f:
      data = f.read()

Para abrirlo como binario. Ahora sí:

    type(data)
    len(data)
    data

Y:

    text = data.decode('utf-16-le')
    type(text)
    len(text)
    text

En Python 3 los textos pierden la `u` precediendo a las cadenas de texto para
que la creación de texto sea implícita mientras que le manejo de bytes se
convierte en la opción `b` y se hace explícito. Justo al revés que en Python2.

Y con esto... ¿lecciones aprendidas?
