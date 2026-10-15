# Flujo multi-agente

Roles de modelo para este proyecto:

- **Orquestador: Opus 5.5** (`claude-opus-5-5`). Es la sesión principal. Planifica, descompone la tarea, delega y decide si el resultado está listo. Se fija al arrancar la sesión (`claude --model claude-opus-5-5`), no desde este archivo.
- **Programador: Sonnet 5.5** (`claude-sonnet-5-5`). Subagente `programador` en `.claude/agents/programador.md`. Escribe el código.
- **Tester: Haiku 5.5** (`claude-haiku-5-5`). Subagente `tester` en `.claude/agents/tester.md`. Ejecuta y escribe pruebas.

Flujo esperado: el orquestador planifica → `programador` implementa → `tester` verifica → el orquestador revisa el diff y reporta. Si el tester falla, vuelve al programador con la salida exacta del fallo.
