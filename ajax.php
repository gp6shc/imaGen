<?php
defined('ABSPATH') or die("Nope.");
	
// AJAX action = make_post
// most be included in the data JS sends for this WP hook to fire
function imaGen_ajax_make_post() {

	// verify request	
	if ( wp_verify_nonce( $_POST['_ajax_nonce'], 'ImaGen') ) {
		$new_post = array(
		  'post_content'   => wp_strip_all_tags($_POST['content']),
		  'post_name'      => wp_strip_all_tags($_POST['name']),
		  'post_title'     => wp_strip_all_tags($_POST['title']),
		  'post_status'    => 'publish',
		  'post_type'      => 'img-gen',
		  'post_author'    => 1 // the first user
		);
		
		$new_post_ID = wp_insert_post( $new_post );
		
		save_featured_image($_POST['img'], $new_post_ID, $_POST['img_name']);
		
		// send some information back to the javascript handler
		$response = array(
			'status' => '200',
			'message' => 'OK',
			'url' => get_permalink($new_post_ID)
		);
	}else{
		$response = array(
			'status' => '401',
			'message' => 'Unauthorized'
		);
	}		

	header( 'Content-Type: application/json; charset=utf-8' );
	echo json_encode( $response );
	
	exit;
}
add_action( 'wp_ajax_make_post', 'imaGen_ajax_make_post' );
add_action( 'wp_ajax_nopriv_make_post', 'imaGen_ajax_make_post' );


function save_featured_image( $b64_image_data, $post_id, $img_name ) {
    $upload_dir = wp_upload_dir();
    $image_data = decode_b64_image($b64_image_data);
    $filename = $img_name;
    
    if (wp_mkdir_p($upload_dir['path'])) {
			$file = $upload_dir['path'] . '/' . $filename;
    }else{
			$file = $upload_dir['basedir'] . '/' . $filename;
		}
    file_put_contents($file, $image_data);

    $wp_filetype = wp_check_filetype($filename, null );
    $attachment = array(
        'post_mime_type' => $wp_filetype['type'],
        'post_title' => sanitize_file_name($filename),
        'post_content' => '',
        'post_status' => 'inherit'
    );
    
    $attach_id = wp_insert_attachment( $attachment, $file, $post_id );
    require_once(ABSPATH . 'wp-admin/includes/image.php');
    $attach_data = wp_generate_attachment_metadata( $attach_id, $file );
    $res1 = wp_update_attachment_metadata( $attach_id, $attach_data );
    $res2 = set_post_thumbnail( $post_id, $attach_id );
}

function decode_b64_image( $b64_data ) {
	$data = explode(',', $b64_data);
	$data = base64_decode($data[1]);
	
	return $data;
}