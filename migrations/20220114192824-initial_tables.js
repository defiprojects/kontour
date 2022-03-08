"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    /* USERS */
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      flags: Sequelize.DataTypes.INTEGER,
      created_at: Sequelize.DataTypes.DATE,
      updated_at: Sequelize.DataTypes.DATE,
    });
    /* END USERS */

    /* PROFILES */
    await queryInterface.createTable("profiles", {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: "users",
          },
          key: "id",
        },
        allowNull: false,
      },
      image_url: Sequelize.DataTypes.STRING,
      twitter_handle: Sequelize.DataTypes.STRING,
      created_at: Sequelize.DataTypes.DATE,
      updated_at: Sequelize.DataTypes.DATE,
    });
    /* END PROFILES */

    /* WEB3_KEYS */
    await queryInterface.createTable("web3_public_keys", {
      key: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: "users",
          },
          key: "id",
        },
        allowNull: false,
      },
      created_at: Sequelize.DataTypes.DATE,
      updated_at: Sequelize.DataTypes.DATE,
    });
    /* END WEB3_KEYS */
    await queryInterface.createTable("nodes", {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      data: Sequelize.DataTypes.JSON,
      created_at: Sequelize.DataTypes.DATE,
      updated_at: Sequelize.DataTypes.DATE,
    });

    await queryInterface.createTable("projects", {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      data: Sequelize.DataTypes.JSON,
      user_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: "users",
          },
          key: "id",
        },
        allowNull: true,
      },
      node_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: "nodes",
          },
          key: "id",
        },
        allowNull: false,
      },
      created_at: Sequelize.DataTypes.DATE,
      updated_at: Sequelize.DataTypes.DATE,
    });

    if (process.env.NODE_ENV !== "production") {
      const sequelize = queryInterface.sequelize;
      await sequelize.query(
        `INSERT into nodes (id, data) VALUES ('b325907e-937a-49d6-ab97-a3f44aafabf4', '{"hostUrl": "http://contour:8545", "chainId": 1337}')`
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("projects");
    await queryInterface.dropTable("profiles");
    await queryInterface.dropTable("web3_public_keys");
    await queryInterface.dropTable("users");
  },
};
