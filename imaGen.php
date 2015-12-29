<?php
/*
	Plugin Name: ImaGen
	Plugin URI: http://sachsmedia.com
	Description: Add a JS based image generator to any page or post through shortcodes.
	Author: Mike
	Author URI: http://sachsmedia.com/team/mike
	Version: 0.1
*/
    
defined('ABSPATH') or die("Nope.");

function img_gen_add_scripts() {
	// loads the css for the shortcode on all pages by default, dequeue if manually styling
	wp_enqueue_style( 'imgGen_style', plugins_url('css/app.css', __FILE__) );
	
	wp_register_script('img_gen_script', plugins_url('js/app.min.js', __FILE__), array(),'0.1', true);
	wp_localize_script('img_gen_script', 'img_gen_vars', array(
			'wpNonce' => wp_create_nonce( 'ImaGen' )
		)
	);
}
add_action( 'wp_enqueue_scripts', 'img_gen_add_scripts' ); 



// [ImaGen] shortcode
function create_img_gen( $atts ){
	ob_start();
  require 'ui.php';
	$output_string = ob_get_contents();;
	ob_end_clean();
	wp_enqueue_script('img_gen_script');
	return $output_string;
}
add_shortcode( 'ImaGen', 'create_img_gen' );


// Create ImaGen Custom Post Type to house dummy landing pages so TW and FB can scrape metadata
function img_gen_init() {
  $args = array(
    'label' => 'ImaGen',
      'public' => true,
      'show_ui' => true,
      'capability_type' => 'post',
      'hierarchical' => false,
      'rewrite' => array('slug' => 'img-gen'),
      'query_var' => true,
      'menu_icon' =>	 'dashicons-format-gallery',
      'supports' => array(
        	'thumbnail', 'title'
				)
      );
	register_post_type( 'img-gen', $args );
}
add_action( 'init', 'img_gen_init' );


// Interrupts single template requests to see if this plugin's CPT template is needed
function get_img_gen_template($single_template) {
	global $post;
	
	if ($post->post_type == 'img-gen') {
		$single_template = dirname( __FILE__ ) . '/single-img-gen.php';
	}
	return $single_template;
}
add_filter( 'single_template', 'get_img_gen_template' );


// Outputs <meta> tags into the head
function add_head_metadata() {
	if (is_singular('img-gen')) {
		$thumb_id = get_post_thumbnail_id();
		$thumb_url = wp_get_attachment_image_src($thumb_id, 'full', true);
		$thumb_url = $thumb_url[0];
		echo '<meta property="og:url" content="'.get_permalink().'" />';
		echo '<meta property="og:title" content="Sneezes Greetings Customizable Holiday E-Card" />';
		echo '<meta property="og:description" content="Ever hear of the germ re-gifter? You know… the coughing, sneezing family member who should have stayed home, but decided to attend the holiday gathering anyway?" />';
		echo '<meta property="og:image" content="'.$thumb_url.'"/>';
		echo '<meta name="twitter:card" content="photo" />';
		echo '<meta name="twitter:site" content="momsVScooties" />';
	}
}
add_action('wp_head', 'add_head_metadata');

// Include functions respsonsible for responding to AJAX posts
require 'ajax.php';

?>