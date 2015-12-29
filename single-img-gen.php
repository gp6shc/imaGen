<?php get_header(); ?>
<!-- Dummy template for inclusion in your  -->
		<div class="">
			<h1>Moms Against Cooties Holiday E-Card</h1>
			
			<?php the_post_thumbnail(); ?>
			<br/>
			<h2>Create Your Own “Sneezes Greetings” E-Card</h2>
			<p>Share the gift of love, not germs, this holiday season with a customizable e-card!</p>
	
			<?php echo do_shortcode('[imaGen]'); ?>
			
			<h4>How to Create Your E-Card:</h4>
			<ol>
				<li>Upload a family photo from your computer.</li>
				<li>Select a sticker(s).</li>
				<li>Download or share your e-card via Facebook, Twitter, Pinterest or email.</li>
			</ol>
		</div>
<?php get_sidebar(); ?>
<?php get_footer(); ?>