<script>
	import * as Tree from '../../src/tree'
</script>

<Tree.Root>
	<Tree.NodeList>
		<Tree.Node>
			<Tree.Item>Item 1</Tree.Item>
			<Tree.NodeList>
				<Tree.Node>
					<Tree.Item>Item 1.1</Tree.Item>
				</Tree.Node>
				<Tree.Node>
					<Tree.Item>Item 1.2</Tree.Item>
					<Tree.NodeList>
						<Tree.Node>
							<Tree.Item>Item 1.2.1</Tree.Item>
						</Tree.Node>
					</Tree.NodeList>
				</Tree.Node>
			</Tree.NodeList>
		</Tree.Node>
		<Tree.Node>
			<Tree.Item>Item 2</Tree.Item>
		</Tree.Node>
	</Tree.NodeList>
</Tree.Root>
