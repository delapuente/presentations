#!/usr/bin/python

import os
import subprocess
from collections import namedtuple
from functools import wraps
from types import MethodType
from protected import Protected

class Git(metaclass=Protected):
            
    def __init__(self, path='.', interactive=False):
        self.interactive = interactive
        self._path = os.path.realpath(path)
        self._setup_commands()

    def _setup_commands(self):
        for command in _available_commands():
            self._install_command(command)

    def _install_command(self, commandname):
        command = _new_command(commandname, self._path)

        @wraps(command)
        def command_method(self, *args, **kwargs):
            result = command(*args, **kwargs)
            if not self.interactive:
                return result
            
            print('OK' if not result.exitcode else 'ERROR')
            message = result.out or result.err
            if message:
                print(message)

            return None
        
        object.__setattr__(self, commandname, MethodType(command_method, self))
        
        
GitResult = namedtuple('GitResult', ['exitcode', 'out', 'err'])

def _available_commands():
    '''Retrieve a list with all git available commands.''' 
    githelp = _new_command('help')
    out = githelp('--all').out
    return out.split('\n\n')[2].split()

def _new_command(command, cwd=None):
    '''Generates a new git command'''
    def _command(*arguments):
        process = subprocess.Popen(['git', command] + list(arguments),
                  stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=cwd,
                  stdin=subprocess.DEVNULL, universal_newlines=True)
        out, err = process.communicate()
        return GitResult(process.returncode, out, err)

    _command.__name__ = command
    _command.__doc__ = 'Use git#help(\'{}\')'.format(command)
    return _command
