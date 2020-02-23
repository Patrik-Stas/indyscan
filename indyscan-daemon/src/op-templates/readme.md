# Operational templates
Operation templates specify how objects in the daemon process should be wired up. The daemon comes with basic 
building blocks such as sources, targets, transformers etc. Some of these objects depends on each other and require 
various constructor parameters. 
In order not to deep dive into depths of the code, you can simply reuse pre-prepared templates based on what operation
you want to perform with the daemon.
