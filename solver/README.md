# pgUI Solver

As requested, this solver is usable in docker. It requires a single build argument that points to the target of the service. For instance, if you were running it at example.com:5000, you would build it like

```bash
cd solver
docker build . --build-arg "TARGET=http://example.com:5000" -t solver
```

and then you can start it with

```bash
docker run -it solver
```

And it should start printing out the flag!

Note that it may be a bit tempermental, there are some potential races (sufficiently tight that I never encountered them, but I'm aware they exist). If this happens, just rerun it until you can reach concensus.