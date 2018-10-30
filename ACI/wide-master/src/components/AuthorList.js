import React from 'react';
import {
  Pill,
  Pane,
  Menu,
  OrderedList,
  ListItem,
  Icon,
  Link,
} from 'evergreen-ui';

export default function AuthorList(props) {
  return (
    <Pane display="flex">
      <Pane width="50%">
        <Menu>
          <Menu.Group>
            <Menu.Item>
              Minkkinen, Maria
              <Pill display="inline-flex" margin={8} color="blue">
                5
              </Pill>
            </Menu.Item>
            <Menu.Item>
              Metsälä, Visa
              <Pill display="inline-flex" margin={8} color="blue">
                6
              </Pill>
            </Menu.Item>
            <Menu.Item>
              Wang, Le
              <Pill display="inline-flex" margin={8} color="blue">
                2
              </Pill>
            </Menu.Item>
          </Menu.Group>
        </Menu>
      </Pane>
      <Pane width="50%">
        <OrderedList>
          <ListItem>
            Eye blinking signal identification and verification based on neural
            network and peak correlation - 2017
            <Link
              href="https://finna.fi/Record/volter.1940570"
              target="blank"
              marginLeft={4}
            >
              <Icon icon="link" size={12} />
            </Link>
          </ListItem>
          <ListItem>
            Eye blinking signal identification and verification based on neural
            network and peak correlation - 2017
            <Link
              href="https://finna.fi/Record/volter.1940570"
              target="blank"
              marginLeft={4}
            >
              <Icon icon="link" size={12} />
            </Link>
          </ListItem>
          <ListItem>
            Eye blinking signal identification and verification based on neural
            network and peak correlation - 2017
            <Link
              href="https://finna.fi/Record/volter.1940570"
              target="blank"
              marginLeft={4}
            >
              <Icon icon="link" size={12} />
            </Link>
          </ListItem>
          <ListItem>
            Eye blinking signal identification and verification based on neural
            network and peak correlation - 2017
            <Link
              href="https://finna.fi/Record/volter.1940570"
              target="blank"
              marginLeft={4}
            >
              <Icon icon="link" size={12} />
            </Link>
          </ListItem>
        </OrderedList>
      </Pane>
    </Pane>
  );
}
