{ pkgs, ... }: {
  channel = "stable-23.11";
  packages = [ pkgs.nodejs pkgs.bun ];
  idx.extensions = [ "astro-build.astro-vscode" ];
  idx.workspace.onCreate.install = ''
    bun i
  '';
  idx.previews = {
    enable = true;
    previews = [
      {
        command =
          [ "bun" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0" ];
        manager = "web";
        id = "web";
      }
    ];
  };
}
