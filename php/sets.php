<?php

  // die (__DIR__);
  // /home/blackslate/Repos/Flash/web/flash/ php
  // /home/blackslate/Repos/Flash/web/flash/ data/introductions/icon.png

  // HARDCODED : Find data/ folder
  $list = array(
    "root"    => dirname(__DIR__)
  , "data"    => dirname(__DIR__) . "/data/"
  , "audio"   => "audio/"
  , "phrases" => "phrases.txt"
  , "icon"    => "icon"
  , "types"   => array(".jpeg",".jpg",".png",".svg",".webp",".gif")
  );



  echo get_icons($list);



  function get_icons($list) {
    $output = "[";

    // Create a list of directories in the data/ folder
    $root = $list["root"];
    $data_folder = $list["data"];
    $sub_folders = scandir($data_folder);
    // Remove . and ..
    array_shift($sub_folders);
    array_shift($sub_folders);

    // Ensure that each folder contains
    // * icon
    // * phrases.txt
    // * audio folder (which may be empty)

    $icon_array = array();

    foreach ($sub_folders as $sub_folder) {
      $folder_path = $data_folder . $sub_folder . "/";

      // Check for an icon, without which the phrase list cannot be shown
      $typeless_path = $folder_path . $list["icon"];
      $types = $list["types"];

      $icon_path = icon_path($typeless_path, $types);
      $valid = !!$icon_path;

      if ($valid) {
        // Check for the phrases.txt file...
        $valid = file_exists($folder_path . $list["phrases"]);

        if ($valid) {
          // ... and an audio/ folder
          $valid = file_exists($folder_path . $list["audio"]);
        }
      } 

      if ($valid) {
        // All expected items exist (but they may not be usable)
        $icon_path = relative_path($icon_path, $root);
        array_push($icon_array, $icon_path);
      }
    }

    foreach ($icon_array as $icon) {
      $output .= '"' . $icon . '", ';
    }

    return  trim($output, ", ") . "]";
  }



  function icon_path ($typeless_path, $types) {
    foreach($types as $type) {
      $icon_path = $typeless_path . $type;
      $exists = file_exists($icon_path);

      if ($exists) {
        // TODO: convert to path relative to root
        return $icon_path;
      }
    }

    return false;
  }



  function relative_path($path, $root) {
    // HACK: consider that the web root is in a folder called "web"
    $separator = substr($path, 0, 1);
    $path_array = explode($separator, $path);
    $root_array = explode($separator, $root);
    $parent = array_shift($path_array);

    while ($parent === array_shift($root_array)) {
      $parent = array_shift($path_array);
    }

    $path = $parent ."/". implode($separator, $path_array);
  
    return $path;
  }
?>
