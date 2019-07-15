<?php
  // HARDCODED : Find data/ folder
  $list = array(
    "root"    => dirname(__DIR__)
  , "data"    => dirname(__DIR__) . "/data/"
  , "audio"   => "audio/"
  , "phrases" => "phrases.txt"
  , "icon"    => "icon"
  , "types"   => array(".jpeg",".jpg",".png",".svg",".webp",".gif")
  );


  $user_data = get_user_data();
  $sets_data = get_sets_data($list);


  echo required_data($user_data, $sets_data);


  //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\


  function get_user_data() {
    $output = "{";
    $user = urldecode($_GET["user"]);

    $output .= "\"name\": " . "\"" . $user . "\"";

    $output .= "}";

    return $output;
  }



  function get_sets_data($list) {
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

      // Check for an icon, without which the phrase list cannot be 
      // shown
      $typeless_path = $folder_path . $list["icon"];
      $types = $list["types"];

      $icon_path = icon_path($typeless_path, $types, $root);
      $phrases_path = $folder_path . $list["phrases"];

      $valid = !!$icon_path;

      if ($valid) {
        // Check for the phrases.txt file...
        $valid = file_exists($phrases_path);
        $time_stamp = filemtime($phrases_path);

        if ($valid) {
          // ... and an audio/ folder
          $valid = file_exists($folder_path . $list["audio"]);
        }
      } 

      if ($valid) {
        // All expected items exist (but they may not be usable)
        $icon_data = 
          "{\"url\": \"".relative_path($icon_path, $root)."\""
        . ", \"timestamp\": ".$time_stamp
        . ", \"customKeys\": []";

        if (substr($icon_path, -4) === ".svg") {
          $icon_data .= ", \"svgString\": \""
                     . fileContents($icon_path) ."\"";
        }

        $icon_data .= "}";

        array_push($icon_array, $icon_data);
      }
    }

    foreach ($icon_array as $icon) {
      $output .= $icon . ', ';
    }

    return  trim($output, ", ") . "]";
  }



  function icon_path ($typeless_path, $types) {
    foreach($types as $type) {
      $icon_path = $typeless_path . $type;
      $exists = file_exists($icon_path);

      if ($exists) {
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



  function fileContents($file_path) {
    $file = fopen($file_path, "r");
    
    $contents = fread($file, filesize($file_path));
    $contents = str_replace("\"", "'", $contents);
    // Line breaks break the JSON.parse() call in JavaScript
    // Multiple spaces are unnecessary
    $contents = preg_replace('/\n+\s*/', "", $contents);
    $contents = preg_replace('/\s{2,}/', " ", $contents);
    fclose(file);

    return $contents;
  }



  function required_data($user_data, $icon_data) {
    $output = "{ ";

    $output .=  "\"user\": " . $user_data;
    $output .= ", \"sets\": " . $icon_data;
    $output .= " }";

    return $output;
  }
?>